"""Run P050 engineering checks with an explicit CSS-free SSR test bundle."""
from pathlib import Path
import concurrent.futures,json,subprocess,sys
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve();out.mkdir(parents=True,exist_ok=False)
def run(script):
    relative=str(script.relative_to(root));log=out/(script.stem+'.log')
    if script.name=='check-nms-l02-p050-intro-view-v1.tsx':
        bundle=out/'intro-view-check.cjs'
        build=subprocess.run(['npx','esbuild',relative,'--bundle','--platform=node','--loader:.css=empty','--outfile='+str(bundle)],cwd=root,capture_output=True,text=True)
        result=subprocess.run(['node',str(bundle)],cwd=root,capture_output=True,text=True) if build.returncode==0 else build
        output=build.stdout+build.stderr+result.stdout+result.stderr
        command=['node',str(bundle)]
    else:
        command=['npx','tsx',relative];result=subprocess.run(command,cwd=root,capture_output=True,text=True);output=result.stdout+result.stderr
    log.write_text(output)
    return {'script':relative,'command':command,'exitCode':result.returncode,'log':str(log)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results=list(pool.map(run,sorted(p for p in root.glob('scripts/check-nms-l02-p050-*') if p.suffix in ['.ts','.tsx'])))
(out/'results.json').write_text(json.dumps(results,indent=2)+'\n')
failed=[row for row in results if row['exitCode']]
print(json.dumps({'checks':len(results),'failed':failed}));sys.exit(bool(failed))
