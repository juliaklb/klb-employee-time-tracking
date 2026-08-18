function identity(request: Request) { return request.headers.get("oai-authenticated-user-email"); }
async function database() {
  const { env } = await import("cloudflare:workers");
  return env.DB;
}

export async function GET(request: Request) {
  const email = identity(request); if (!email) return Response.json({error:"Sign-in required"},{status:401});
  const db = await database();
  const user = await db.prepare("SELECT role FROM users WHERE email = ?").bind(email).first<{role:string}>();
  const rows = user?.role === "admin"
    ? await db.prepare("SELECT t.*, u.name FROM timesheets t JOIN users u ON u.email=t.employee_email ORDER BY t.updated_at DESC").all()
    : await db.prepare("SELECT * FROM timesheets WHERE employee_email = ? ORDER BY updated_at DESC").bind(email).all();
  return Response.json({role:user?.role ?? "employee",timesheets:rows.results});
}

export async function POST(request: Request) {
  const email = identity(request); if (!email) return Response.json({error:"Sign-in required"},{status:401});
  const db = await database();
  const body = await request.json() as {week:number;periodStart:string;action:"draft"|"submit";entries:Array<{date:string;status:string;hours:number;lieuUsed:number;lieuAccrued:number;travel:boolean;notes:string}>};
  if (![1,2].includes(body.week) || !/^20\d{2}-\d{2}-\d{2}$/.test(body.periodStart) || !Array.isArray(body.entries)) return Response.json({error:"Invalid timesheet"},{status:400});
  const fullName = request.headers.get("oai-authenticated-user-full-name");
  const count = await db.prepare("SELECT COUNT(*) AS count FROM users").first<{count:number}>();
  await db.prepare("INSERT OR IGNORE INTO users(email,name,role,created_at) VALUES(?,?,?,?)").bind(email,fullName?decodeURIComponent(fullName):email,(count?.count??0)===0?"admin":"employee",Date.now()).run();
  const status=body.action==="submit"?"submitted":"draft", now=Date.now();
  await db.prepare("INSERT INTO timesheets(employee_email,period_start,week,status,submitted_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(employee_email,period_start,week) DO UPDATE SET status=excluded.status,submitted_at=excluded.submitted_at,updated_at=excluded.updated_at").bind(email,body.periodStart,body.week,status,status==="submitted"?now:null,now).run();
  const sheet=await db.prepare("SELECT id FROM timesheets WHERE employee_email=? AND period_start=? AND week=?").bind(email,body.periodStart,body.week).first<{id:number}>();
  if(!sheet) return Response.json({error:"Unable to save"},{status:500});
  await db.prepare("DELETE FROM time_entries WHERE timesheet_id=?").bind(sheet.id).run();
  const statements=body.entries.map((e,i)=>db.prepare("INSERT INTO time_entries(timesheet_id,work_date,status,hours,lieu_used,lieu_accrued,travel,notes) VALUES(?,?,?,?,?,?,?,?)").bind(sheet.id,`2026-08-${24+i}`,e.status,Number(e.hours)||0,Number(e.lieuUsed)||0,Number(e.lieuAccrued)||0,e.travel?1:0,String(e.notes||"").slice(0,500)));
  if(statements.length) await db.batch(statements);
  return Response.json({ok:true,status});
}

export async function DELETE(request: Request) {
  const email=identity(request); if(!email) return Response.json({error:"Sign-in required"},{status:401});
  const id=Number(new URL(request.url).searchParams.get("id")); if(!Number.isInteger(id)||id<1) return Response.json({error:"Invalid entry"},{status:400});
  const db=await database(); const user=await db.prepare("SELECT role FROM users WHERE email=?").bind(email).first<{role:string}>();
  const entry=await db.prepare("SELECT id,employee_email FROM timesheets WHERE id=?").bind(id).first<{id:number;employee_email:string}>();
  if(!entry) return Response.json({error:"Not found"},{status:404});
  if(entry.employee_email!==email&&user?.role!=="admin") return Response.json({error:"Forbidden"},{status:403});
  await db.batch([db.prepare("DELETE FROM time_entries WHERE timesheet_id=?").bind(id),db.prepare("DELETE FROM timesheets WHERE id=?").bind(id)]);
  return Response.json({ok:true});
}
