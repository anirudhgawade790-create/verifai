"use client";
import {useEffect,useState} from "react";
import {Status} from "./Dashboard";
type D={id:string,name:string,type:string,status:string,filename:string,extracted?:Record<string,string>,mock:boolean};
type F={id:string,title:string,severity:string,status:string,explanation:string,evidence:string};
type R={id:string,label:string,status:string,evidence:string};
type Obs={id:string,authorId:string,message:string,createdAt:string};
type A={id:string,institution:string,category:string,status:string,submitted:string,assignedOfficer:string,documents:D[],findings:F[],rules:R[],audit?:{at:string;actor:string;action:string}[],observations:Obs[]};

export default function ApplicationDetail({id}:{id:string}){
  const [app,setApp]=useState<A|null>(null);
  const [tab,setTab]=useState("Overview");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [confirm,setConfirm]=useState<'approve'|'reject'|null>(null);
  const [rejectReason,setRejectReason]=useState('');
  const [uploadProgress,setUploadProgress]=useState(0);
  const [uploading,setUploading]=useState(false);

  useEffect(()=>{fetch(`/api/applications/${id}`).then(r=>r.ok?r.json():null).then(d=>d?.application&&setApp(normalize(d.application)))},[id]);

  async function action(method:"PATCH"|"POST",url:string,body?:object){setBusy(true);const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});if(r.ok){const next=await r.json();if(method==="PATCH") setApp(normalize(next.application||next)); else {const refreshed=await fetch(`/api/applications/${id}`).then(x=>x.json());setApp(normalize(refreshed.application));}setNotice(method==="PATCH"?"Application status updated.":"Observation recorded.")}else setNotice("The action is not permitted for this role.");setBusy(false)}

  if(!app)return <div className="panel empty">Loading application…</div>;

  const riskScore = Math.min(100, app.findings.reduce((s: number, f: {severity:string}) => s + (f.severity==='High'?30:f.severity==='Medium'?15:5), 0));
  const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

  return <>
    <div className="page-heading detail-heading">
      <div>
        <div className="breadcrumb">APPLICATIONS / {app.id}</div>
        <h1>{app.institution}</h1>
        <p>{app.category} <span>·</span> Submitted {new Date(app.submitted).toLocaleDateString("en-IN")}</p>
      </div>
      <div className="heading-actions">
        <Status value={app.status}/>
        <button className="primary compact" disabled={busy||['Approved','Rejected'].includes(app.status)} onClick={()=>setConfirm('approve')}>Approve</button>
        <button className="secondary compact" style={{borderColor:'#d86666',color:'#b05241'}} disabled={busy||['Approved','Rejected'].includes(app.status)} onClick={()=>setConfirm('reject')}>Reject</button>
        <button className="secondary" disabled={busy||app.status!=="In Review"} onClick={()=>action("PATCH",`/api/applications/${id}/status`,{status:"Clarification Requested"})}>Request clarification</button>
        <button className="primary compact" disabled={busy||!["Submitted","Under Review","Verification Pending","Observations Raised","Clarification Requested"].includes(app.status)} onClick={()=>action("PATCH",`/api/applications/${id}/status`,{status:app.status==="Observations Raised"||app.status==="Clarification Requested"?"Under Review":"In Review"})}>Advance review</button>
      </div>
    </div>

    {notice&&<div className="notice">✓ {notice}</div>}
    <div className="detail-tabs">{["Overview","Documents","Compliance","Findings","Audit trail"].map(x=><button className={tab===x?"active":""} onClick={()=>setTab(x)} key={x}>{x}{x==="Findings"&&<b>{app.findings.length}</b>}</button>)}</div>

    {tab==="Overview"&&<div className="detail-grid">
      <section className="panel">
        <div className="panel-head"><h2>Case summary</h2></div>
        <dl className="facts">
          <div><dt>Application ID</dt><dd>{app.id}</dd></div>
          <div><dt>Institution</dt><dd>{app.institution}</dd></div>
          <div><dt>Assigned officer</dt><dd>{app.assignedOfficer}</dd></div>
          <div><dt>Document checks</dt><dd>{app.documents.filter(d=>d.status==="Verified").length} verified / {app.documents.length}</dd></div>
          <div><dt>Risk score</dt><dd><span className={`risk-score ${riskLevel}`}>{riskScore}</span></dd></div>
        </dl>
      </section>
      <section className="panel">
        <div className="panel-head"><h2>Priority actions</h2></div>
        <div className="action-list">
          {app.documents.filter(d=>d.status!=="Verified").slice(0,3).map(d=><div key={d.id}><span>!</span><div><b>{d.name}</b><p>{d.status}</p></div></div>)}
          {app.findings.slice(0,2).map(f=><div key={f.id}><span>△</span><div><b>{f.title}</b><p>{f.severity} · {f.status}</p></div></div>)}
        </div>
      </section>
      <section className="panel full">
        <div className="panel-head"><h2>Officer observation</h2></div>
        {app.observations && app.observations.length > 0 && (
          <div style={{borderBottom:'1px solid var(--line)',padding:'14px 20px'}}>
            <div style={{marginBottom:10,fontWeight:700,fontSize:12}}>Previous observations</div>
            {app.observations.map(o=>(
              <div key={o.id} style={{padding:'10px 0',borderBottom:'1px solid #edf0f4'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#536278'}}>{o.authorId} · {new Date(o.createdAt).toLocaleString('en-IN')}</div>
                <div style={{fontSize:12,marginTop:4}}>{o.message}</div>
              </div>
            ))}
          </div>
        )}
        <Observation onSave={text=>action("POST",`/api/applications/${id}/observations`,{text})}/>
      </section>
    </div>}

    {tab==="Documents"&&<div>
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--line)'}}>
        <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>Upload document</div>
        <label
          className={`upload-area${uploading?' drag-over':''}`}
          style={{display:'block'}}
        >
          <span className="upload-icon">📄</span>
          <span style={{fontSize:12,display:'block',marginBottom:6}}>{uploading?'Uploading…':'Drag and drop or click to upload (PDF, JPG, PNG · max 15 MB)'}</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={async e=>{
            const file=e.target.files?.[0];if(!file)return;
            setUploading(true);setUploadProgress(0);
            const form=new FormData();form.append('file',file);
            const progressInterval=setInterval(()=>setUploadProgress(p=>Math.min(90,p+10)),150);
            const r=await fetch(`/api/applications/${id}/documents/upload`,{method:'POST',body:form});
            clearInterval(progressInterval);setUploadProgress(100);
            setTimeout(()=>{setUploading(false);setUploadProgress(0);},400);
            if(r.ok){const next=await r.json();setApp(normalize(next.application));setNotice('Document uploaded successfully.');}
            else setNotice('Upload failed. Check file type and size (PDF/JPG/PNG, max 15 MB).');
            e.target.value='';
          }}/>
        </label>
        {uploading && <div className="progress-bar"><div className="progress-fill" style={{width:uploadProgress+'%'}}/></div>}
      </div>
      <div className="doc-grid">{app.documents.map(d=><section className="panel doc-card" key={d.id}><div className="doc-preview"><span>PDF</span><b>{d.filename}</b></div><div className="doc-info"><div><h3>{d.name}</h3><Status value={d.status}/></div>{d.mock&&<p className="mock">Mock OCR adapter · not externally verified</p>}<dl>{Object.entries(d.extracted||{}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div></section>)}</div>
    </div>}

    {tab==="Compliance"&&<section className="panel"><div className="rule-list">{app.rules.map(r=><div key={r.id}><Status value={r.status}/><div><b>{r.label}</b><p>{r.evidence}</p></div><small>Rule v1.0</small></div>)}</div></section>}

    {tab==="Findings"&&<section className="panel"><div className="finding-list">{app.findings.map(f=><article key={f.id}><div className={`severity ${f.severity.toLowerCase()}`}>{f.severity}</div><div><b>{f.title}</b><p>{f.explanation}</p><small>{f.evidence}</small></div><button className="secondary">Review finding</button></article>)}</div></section>}

    {tab==="Audit trail"&&<section className="panel"><div className="timeline">{app.audit?.map((e,i)=><div key={i}><i/><div><b>{e.action}</b><p>{e.actor} · {new Date(e.at).toLocaleString("en-IN")}</p></div></div>)}</div></section>}

    {confirm && (
      <div className="confirm-dialog" onClick={()=>setConfirm(null)}>
        <div className="dialog-box" onClick={e=>e.stopPropagation()}>
          {confirm==='approve' && (
            <><h3>Confirm approval</h3><p>This will set the application status to <strong>Approved</strong>. This action is recorded in the audit trail.</p><div className="dialog-actions"><button className="secondary" onClick={()=>setConfirm(null)}>Cancel</button><button className="primary" disabled={busy} onClick={()=>{action('PATCH',`/api/applications/${id}/status`,{status:'Approved'});setConfirm(null);}}>Confirm approval</button></div></>
          )}
          {confirm==='reject' && (
            <><h3>Confirm rejection</h3><p>Provide a mandatory reason for rejection (minimum 10 characters).</p><textarea style={{width:'100%',minHeight:80,border:'1px solid #dce3ed',borderRadius:6,padding:'10px',marginBottom:14,resize:'vertical',fontFamily:'inherit',fontSize:13}} value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="State the reason for rejection…"/><div className="dialog-actions"><button className="secondary" onClick={()=>{setConfirm(null);setRejectReason('');}}>Cancel</button><button className="primary" disabled={busy||rejectReason.trim().length<10} onClick={async()=>{await action('POST',`/api/applications/${id}/observations`,{text:rejectReason.trim()});await action('PATCH',`/api/applications/${id}/status`,{status:'Rejected'});setConfirm(null);setRejectReason('');}}>Confirm rejection</button></div></>
          )}
        </div>
      </div>
    )}
  </>;
}

function normalize(a:any):A{
  return {
    id:a.id,
    institution:a.institutionName||a.institution||"Institution",
    category:a.category||a.programme||"Application",
    status:a.status,
    submitted:a.submittedAt||a.submitted,
    assignedOfficer:a.assignedOfficer||"Unassigned",
    documents:(a.documents||[]).map((d:any)=>({id:d.id,name:d.name||d.type||"Document",type:d.type||"Document",status:d.status,filename:d.filename||d.name||"evidence.pdf",extracted:d.extracted||d.metadata||{},mock:d.mock!==false})),
    findings:(a.findings||[]).map((f:any)=>({id:f.id,title:f.title||f.description||"Finding",severity:f.severity||"Medium",status:f.status||"Open",explanation:f.description||f.explanation||"",evidence:f.evidence||"Evidence to be reviewed"})),
    rules:(a.compliance||a.rules||[]).map((r:any)=>({id:r.id,label:r.requirement||r.label,status:r.status,evidence:r.evidence||"Requirement evidence recorded"})),
    audit:(a.audit||[]).map((e:any)=>({id:e.id,action:e.action,actor:e.actorName||e.actorId||"System",at:e.createdAt||e.at})),
    observations:(a.observations||[]).map((o:any)=>({id:o.id,authorId:o.authorId||o.actor||'Unknown',message:o.message||o.text||'',createdAt:o.createdAt||o.at||new Date().toISOString()}))
  };
}

function Observation({onSave}:{onSave:(text:string)=>void}){const [text,setText]=useState("");return <div className="observation"><textarea id="observation" value={text} onChange={e=>setText(e.target.value)} placeholder="Record evidence-based observations for this case…"/><button className="secondary" disabled={!text.trim()} onClick={()=>{onSave(text);setText("")}}>Record observation</button></div>}
