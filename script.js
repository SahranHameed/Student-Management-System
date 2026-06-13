// ===== DATA =====
let students = [
  {id:1, name:"Arjun Kumar", roll:"CS2024001", dept:"Computer Science", year:"2nd Year", email:"arjun@mail.com"},
  {id:2, name:"Priya Devi", roll:"CS2024002", dept:"Computer Science", year:"2nd Year", email:"priya@mail.com"},
  {id:3, name:"Ravi Shankar", roll:"EC2024001", dept:"Electronics", year:"1st Year", email:"ravi@mail.com"},
  {id:4, name:"Meena Lakshmi", roll:"ME2024001", dept:"Mechanical", year:"3rd Year", email:"meena@mail.com"},
  {id:5, name:"Karthik Raja", roll:"CS2024003", dept:"Computer Science", year:"2nd Year", email:"karthik@mail.com"},
];

let marks = {
  1:{tamil:88,english:76,maths:92,science:85,computer:95,social:70},
  2:{tamil:72,english:68,maths:55,science:60,computer:78,social:65},
  3:{tamil:45,english:50,maths:40,science:48,computer:55,social:42},
  4:{tamil:90,english:88,maths:94,science:91,computer:89,social:93},
  5:{tamil:65,english:70,maths:75,science:68,computer:80,social:62},
};
let attendance = {};
let nextId = 6;

// Load Data
students = JSON.parse(localStorage.getItem("students")) || students;
marks = JSON.parse(localStorage.getItem("marks")) || marks;
attendance = JSON.parse(localStorage.getItem("attendance")) || attendance;
nextId = students.length ? Math.max(...students.map(s=>s.id)) + 1 : 1;

function saveToStorage() {

  localStorage.setItem(
    "students",
    JSON.stringify(students)
  );

  localStorage.setItem(
    "marks",
    JSON.stringify(marks)
  );

  localStorage.setItem(
    "attendance",
    JSON.stringify(attendance)
  );
}

// ===== HELPERS =====
function getAvg(m){ if(!m) return 0; let s=m.tamil+m.english+m.maths+m.science+m.computer+m.social; return Math.round(s/6); }
function getGrade(avg){ if(avg>=80) return 'A'; if(avg>=65) return 'B'; if(avg>=50) return 'C'; return 'F'; }
function gradeBadge(g){ return `<span class="grade-badge grade-${g}">${g}</span>`; }
function showToast(msg){ $('#toast').text(msg).fadeIn(200); setTimeout(()=>$('#toast').fadeOut(400),2500); }
function navigate(page){ $('.nav-item-custom').removeClass('active'); $(`.nav-item-custom[data-page="${page}"]`).addClass('active'); showPage(page); }

// ===== NAVIGATION =====
$(document).on('click','.nav-item-custom', function(){
  $('.nav-item-custom').removeClass('active');
  $(this).addClass('active');
  showPage($(this).data('page'));
});

function showPage(page){
  $('.page-section').removeClass('active');
  $(`#page-${page}`).addClass('active');
  const titles={dashboard:'Dashboard',students:'Students',marks:'Marks Entry',grades:'Grade Report',attendance:'Attendance'};
  $('#page-title').text(titles[page]||page);
  if(page==='dashboard') renderDashboard();
  if(page==='students') renderStudents();
  if(page==='marks') renderMarks();
  if(page==='grades') renderGrades();
  if(page==='attendance') renderAttendance();
}

// ===== DASHBOARD =====
function renderDashboard(){
  let pass=0,fail=0,totalAvg=0;
  students.forEach(s=>{
    let avg=getAvg(marks[s.id]);
    totalAvg+=avg;
    if(avg>=50) pass++; else fail++;
  });
  $('#stat-total').text(students.length);
  $('#stat-pass').text(pass);
  $('#stat-fail').text(fail);
  $('#stat-avg').text(students.length ? Math.round(totalAvg/students.length)+'%' : '0%');

  // Recent table
  let rows='';
  students.slice(-5).reverse().forEach(s=>{
    let avg=getAvg(marks[s.id]), g=getGrade(avg);
    rows+=`<tr><td>${s.name}</td><td>${s.dept.split(' ')[0]}</td><td>${avg}%</td><td>${gradeBadge(g)}</td></tr>`;
  });
  $('#dashboard-table tbody').html(rows||'<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:20px;">No students yet</td></tr>');

  // Grade chart
  let grades={A:0,B:0,C:0,F:0};
  students.forEach(s=>{ let g=getGrade(getAvg(marks[s.id])); grades[g]++; });
  let max=Math.max(...Object.values(grades),1);
  const colors={A:'#22c55e',B:'#3b82f6',C:'#f59e0b',F:'#ef4444'};
  let bars='';
  Object.entries(grades).forEach(([g,v])=>{
    let h=Math.round((v/max)*110);
    bars+=`<div class="bar-col"><div class="bar-value">${v}</div><div class="bar-fill" style="height:${h}px;background:${colors[g]};"></div><div class="bar-label">${g}</div></div>`;
  });
  $('#grade-chart').html(bars);
}

// ===== STUDENTS =====
function renderStudents(){
  let filtered=[...students];
  let search=$('#search-input').val().toLowerCase();
  let dept=$('#filter-dept').val();
  if(search) filtered=filtered.filter(s=>s.name.toLowerCase().includes(search)||s.roll.toLowerCase().includes(search));
  if(dept) filtered=filtered.filter(s=>s.dept===dept);
  $('#student-count').text(filtered.length);
  let rows='';
  filtered.forEach((s,i)=>{
    rows+=`<tr>
      <td>${i+1}</td>
      <td><strong>${s.name}</strong></td>
      <td><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">${s.roll}</code></td>
      <td>${s.dept}</td>
      <td>${s.year}</td>
      <td style="color:#2563eb;">${s.email}</td>
      <td><button onclick="deleteStudent(${s.id})" style="background:#fee2e2;color:#dc2626;border:none;padding:5px 10px;border-radius:6px;font-size:12px;cursor:pointer;"><i class="bi bi-trash"></i></button></td>
    </tr>`;
  });
  $('#student-table tbody').html(rows||'<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:24px;">No students found</td></tr>');
}

function addStudent(){

  let name = $('#inp-name').val().trim();
  let roll = $('#inp-roll').val().trim();
  let dept = $('#inp-dept').val();
  let year = $('#inp-year').val();
  let email = $('#inp-email').val().trim();

  if(!name || !roll || !dept || !year){
    showToast('⚠️ Please fill all required fields');
    return;
  }

  if(students.find(s => s.roll === roll)){
    showToast('⚠️ Roll number already exists');
    return;
  }

  students.push({
    id: nextId++,
    name,
    roll,
    dept,
    year,
    email
  });

  saveToStorage();

  renderStudents();

  showToast('✅ Student added successfully!');
}

function deleteStudent(id){

  students = students.filter(s => s.id !== id);

  delete marks[id];

  saveToStorage();   // 👈 Add Here

  renderStudents();

  showToast('🗑️ Student deleted');
}

$('#search-input,#filter-dept').on('input change', renderStudents);

// ===== MARKS =====
function renderMarks(){
  let opts=students.map(s=>`<option value="${s.id}">${s.name} (${s.roll})</option>`).join('');
  $('#marks-student').html('<option value="">Select student</option>'+opts);
  renderMarksTable();
}

function renderMarksTable(){
  let rows='';
  students.forEach(s=>{
    let m=marks[s.id];
    if(m){
      let total=m.tamil+m.english+m.maths+m.science+m.computer+m.social;
      rows+=`<tr><td><strong>${s.name}</strong></td><td>${m.tamil}</td><td>${m.english}</td><td>${m.maths}</td><td>${m.science}</td><td>${m.computer}</td><td>${m.social}</td><td><strong>${total}</strong></td></tr>`;
    }
  });
  $('#marks-table tbody').html(rows||'<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:20px;">No marks entered yet</td></tr>');
}

function saveMarks(){
  let sid=parseInt($('#marks-student').val());
  if(!sid){showToast('⚠️ Select a student first');return;}
  let fields=['tamil','english','maths','science','computer','social'];
  let m={};
  let valid=true;
  fields.forEach(f=>{
    let v=parseInt($(`#m-${f}`).val());
    if(isNaN(v)||v<0||v>100){valid=false;} else m[f]=v;
  });
  if(!valid){showToast('⚠️ Enter valid marks (0-100)');return;}
  marks[sid] = m;

saveToStorage();   // 👈 Add Here

renderMarksTable();

showToast('✅ Marks saved!');
}

function clearMarks(){
  ['tamil','english','maths','science','computer','social'].forEach(f=>$(`#m-${f}`).val(''));
  $('#marks-student').val('');
}

// ===== GRADES =====
function renderGrades(){
  let rows='';
  students.forEach(s=>{
    let m=marks[s.id];
    if(m){
      let total=m.tamil+m.english+m.maths+m.science+m.computer+m.social;
      let avg=Math.round(total/6);
      let g=getGrade(avg);
      let color=g==='A'?'#22c55e':g==='B'?'#3b82f6':g==='C'?'#f59e0b':'#ef4444';
      let status=avg>=50?'<span class="grade-badge status-present">Pass</span>':'<span class="grade-badge status-absent">Fail</span>';
      rows+=`<tr>
        <td><strong>${s.name}</strong></td>
        <td><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">${s.roll}</code></td>
        <td>${s.dept.split(' ')[0]}</td>
        <td>${total}/600</td>
        <td>${avg}%</td>
        <td style="width:120px;"><div class="marks-bar"><div class="marks-bar-fill" style="width:${avg}%;background:${color};"></div></div></td>
        <td>${gradeBadge(g)}</td>
        <td>${status}</td>
      </tr>`;
    }
  });
  $('#grade-table tbody').html(rows||'<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:24px;">No marks data. Enter marks first.</td></tr>');
}

function printReport(){ window.print(); }

// ===== ATTENDANCE =====
function renderAttendance(){
  let today=new Date().toISOString().split('T')[0];
  $('#att-date').val(today);
  let html='';
  students.forEach(s=>{
    let key=`${s.id}_${today}`;
    let status=attendance[key]||'present';
    html+=`<div class="col-md-4 col-6">
      <div style="background:#f8fafc;border-radius:12px;padding:14px;display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#2563eb;">${s.name[0]}</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;">${s.name}</div>
          <div style="font-size:11px;color:#94a3b8;">${s.roll}</div>
        </div>
        <div style="display:flex;gap:6px;">
          <div class="att-circle ${status==='present'?'present':''}" onclick="toggleAtt(${s.id},'present')" id="p-${s.id}" title="Present">P</div>
          <div class="att-circle ${status==='absent'?'absent':''}" onclick="toggleAtt(${s.id},'absent')" id="a-${s.id}" title="Absent">A</div>
        </div>
      </div>
    </div>`;
  });
  $('#att-list').html(html||'<div style="color:#94a3b8;padding:20px;">No students added yet.</div>');
  renderAttTable();
}

function toggleAtt(sid, status){
  let date=$('#att-date').val();
  let key=`${sid}_${date}`;
  attendance[key]=status;
  $(`#p-${sid}`).toggleClass('present', status==='present').removeClass(status==='absent'?'present':'');
  $(`#a-${sid}`).toggleClass('absent', status==='absent').removeClass(status==='present'?'absent':'');
  renderAttTable();
}

function markAll(status){
  let date=$('#att-date').val();
  students.forEach(s=>{
    attendance[`${s.id}_${date}`]=status;
    if(status==='present'){$(`#p-${s.id}`).addClass('present');$(`#a-${s.id}`).removeClass('absent');}
    else{$(`#a-${s.id}`).addClass('absent');$(`#p-${s.id}`).removeClass('present');}
  });
  renderAttTable();
}

function saveAttendance(){

   saveToStorage();   // 👈 Add Here

   showToast('✅ Attendance saved');
}
function renderAttTable(){
  let rows='';
  students.forEach(s=>{
    let present=0,absent=0;
    Object.keys(attendance).forEach(k=>{ if(k.startsWith(s.id+'_')){ if(attendance[k]==='present') present++; else absent++; } });
    let total=present+absent;
    let pct=total>0?Math.round((present/total)*100):0;
    let status=pct>=75?'<span class="grade-badge status-present">Good</span>':'<span class="grade-badge status-absent">Low</span>';
    rows+=`<tr><td><strong>${s.name}</strong></td><td>${s.roll}</td><td style="color:#16a34a;">${present}</td><td style="color:#dc2626;">${absent}</td><td>${pct}%</td><td>${total>0?status:'—'}</td></tr>`;
  });
  $('#att-table tbody').html(rows||'<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No attendance data</td></tr>');
}

// ===== INIT =====
$(document).ready(function(){
  let d=new Date();
  $('#today-date').text(d.toLocaleDateString('en-IN',{weekday:'short',year:'numeric',month:'short',day:'numeric'}));
  renderDashboard();
});