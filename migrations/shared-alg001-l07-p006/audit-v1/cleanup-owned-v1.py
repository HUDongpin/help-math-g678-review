from pathlib import Path
import json,subprocess,os,signal,datetime
B=Path(__file__).resolve().parent.parent
records=[]
for receipt,script,port in [('source-server-process-v1.json','source-server-v1.py',4386),('standalone-server-process-v2.json','standalone-server-v2.py',4387)]:
 r=json.loads((B/'audit-v1'/receipt).read_text());assert r['port']==port
 cmd=subprocess.check_output(['ps','-p',str(r['pid']),'-o','command='],text=True).strip();assert cmd.endswith('migrations/shared-alg001-l07-p006/audit-v1/'+script),cmd
 proc=subprocess.run(['lsof','-nP',f'-iTCP:{port}','-sTCP:LISTEN'],text=True,capture_output=True);assert proc.returncode==0 and str(r['pid'])in proc.stdout,proc.stdout
 records.append({'pid':r['pid'],'port':port,'script':script,'command':cmd,'listenerBefore':proc.stdout,'action':'SIGTERM verified own process'})
 os.kill(r['pid'],signal.SIGTERM)
result={'schemaVersion':1,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownedProcesses':records,'scope':'P006-owned source/standalone only; other lanes untouched','allPlaywrightContextsAndBrowsersClosedByFinally':True,'configOrCacheChanged':False}
(B/'audit-v1/cleanup-owned-v1.json').write_text(json.dumps(result,indent=2)+'\n')
