const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const themeToggle = $('#themeToggle');
if (localStorage.getItem('rb-theme') === 'dark') document.body.classList.add('dark');
function syncThemeIcon(){ themeToggle.textContent = document.body.classList.contains('dark') ? '☀' : '☾'; }
syncThemeIcon();
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('rb-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  syncThemeIcon();
});

const menuToggle = $('#menuToggle'), topNav = $('#topNav');
menuToggle.addEventListener('click', () => {
  const open = topNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
$$('#topNav a').forEach(a => a.addEventListener('click', () => topNav.classList.remove('open')));

const chapters = $$('.chapter');
const navLinks = $$('#sideNav a');
const readState = JSON.parse(localStorage.getItem('rb-read') || '{}');
function updateReadProgress(){
  const count = chapters.filter(c => readState[c.id]).length;
  const pct = Math.round(count / chapters.length * 100);
  $('#progressText').textContent = pct + '%';
  $('#sideProgress').style.width = pct + '%';
}
chapters.forEach(ch => {
  const btn = $('.mark-read', ch);
  const set = () => {
    const done = !!readState[ch.id];
    btn.classList.toggle('done', done);
    btn.textContent = done ? '✓ Selesai' : 'Tandai selesai ○';
  };
  set();
  btn.addEventListener('click', () => {
    readState[ch.id] = !readState[ch.id];
    localStorage.setItem('rb-read', JSON.stringify(readState));
    set(); updateReadProgress();
  });
});
updateReadProgress();
$('#resetProgress').addEventListener('click', () => {
  if (!confirm('Atur ulang semua tanda materi selesai?')) return;
  Object.keys(readState).forEach(k => delete readState[k]);
  localStorage.removeItem('rb-read');
  $$('.mark-read').forEach(b => {b.classList.remove('done');b.textContent='Tandai selesai ○';});
  updateReadProgress();
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, {rootMargin:'-20% 0px -65% 0px'});
chapters.forEach(ch => observer.observe(ch));

$('#searchInput').addEventListener('input', e => {
  const term = e.target.value.toLowerCase().trim();
  navLinks.forEach(link => {
    const target = $(link.getAttribute('href'));
    const haystack = (link.textContent + ' ' + (target?.innerText || '')).toLowerCase();
    link.style.display = haystack.includes(term) ? 'flex' : 'none';
  });
});

window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $('#readingProgress').style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
});

const questions = [
{q:'Teks berita merupakan teks yang bertujuan untuk ....',o:['Menghibur pembaca melalui cerita khayalan','Menyampaikan informasi mengenai peristiwa nyata','Memengaruhi pembaca melalui pendapat pribadi','Menggambarkan objek secara rinci','Memberikan petunjuk melakukan sesuatu'],a:1,e:'Teks berita menyampaikan informasi mengenai peristiwa nyata yang faktual dan aktual.'},
{q:'Perbedaan paling tepat antara aktual dan faktual adalah ....',o:['Aktual berarti benar, faktual berarti menarik','Aktual berarti terbaru, faktual berarti berdasarkan kenyataan','Aktual berarti objektif, faktual berarti subjektif','Aktual berarti lengkap, faktual berarti singkat','Keduanya memiliki arti sama'],a:1,e:'Aktual berkaitan dengan kebaruan informasi, sedangkan faktual berkaitan dengan kebenaran berdasarkan kenyataan.'},
{q:'Bagian berita yang memuat inti informasi dan biasanya terdapat pada paragraf pertama disebut ....',o:['Headline','Body','Lead','Leg','Ilustrasi'],a:2,e:'Lead atau teras berita merupakan pembuka yang berisi inti informasi.'},
{q:'Unsur berita yang menjelaskan alasan terjadinya suatu peristiwa adalah ....',o:['What','Who','When','Why','How'],a:3,e:'Why menjawab pertanyaan mengapa suatu peristiwa terjadi.'},
{q:'Kata yang termasuk konjungsi temporal adalah ....',o:['Karena','Sehingga','Akibatnya','Kemudian','Disebabkan'],a:3,e:'Kemudian menunjukkan urutan waktu atau kejadian.'},
{q:'Kalimat yang termasuk fakta adalah ....',o:['Kegiatan itu sangat luar biasa','Menurut saya sekolah tersebut terbaik','Sebanyak 200 siswa mengikuti kegiatan pada Senin pagi','Kegiatan tersebut paling menyenangkan','Seharusnya semua siswa ikut'],a:2,e:'Jumlah peserta dan waktu pelaksanaan merupakan informasi yang dapat diverifikasi.'},
{q:'Pola piramida terbalik dalam penulisan berita berarti ....',o:['Informasi tambahan ditempatkan di awal','Informasi paling penting ditempatkan di awal','Semua informasi memiliki tingkat kepentingan sama','Berita selalu dimulai dengan opini','Informasi disusun berdasarkan abjad'],a:1,e:'Piramida terbalik mengutamakan informasi paling penting di bagian awal.'},
{q:'Kata kerja pewarta terdapat pada kalimat ....',o:['Warga merasa khawatir','Hujan turun sangat deras','Kepala desa menjelaskan kondisi wilayah tersebut','Sungai mengalir ke laut','Rumah itu sangat besar'],a:2,e:'Menjelaskan merupakan kata kerja yang digunakan untuk melaporkan perkataan narasumber.'},
{q:'Kalimat yang menggunakan konjungsi kausalitas adalah ....',o:['Setelah itu, petugas datang','Kemudian warga berkumpul','Sebelum kegiatan dimulai, peserta berdoa','Banjir terjadi karena hujan deras','Pada pagi hari, warga bekerja'],a:3,e:'Karena menghubungkan sebab dengan akibat.'},
{q:'Orang yang memberikan informasi dalam wawancara disebut ....',o:['Editor','Reporter','Pembaca','Narasumber','Penyunting'],a:3,e:'Narasumber merupakan pihak yang memberikan informasi.'},
{q:'Kalimat berikut yang merupakan opini adalah ....',o:['Gempa terjadi pada pukul 09.00 WIB','Sebanyak 50 warga dievakuasi','Kegiatan dimulai pada hari Senin','Menurut saya, kegiatan itu sangat bermanfaat','Acara berlangsung di aula sekolah'],a:3,e:'Frasa menurut saya menunjukkan penilaian subjektif.'},
{q:'Jenis berita yang bertujuan mengungkap fakta tersembunyi melalui penyelidikan mendalam disebut ....',o:['Straight news','Feature news','Investigation news','Opinion news','Interpretative news'],a:2,e:'Investigation news adalah berita hasil penyelidikan mendalam.'},
{q:'Penulisan kata depan dan awalan yang benar terdapat pada pilihan ....',o:['Disekolah dan di baca','Di rumah dan ditulis','Dirumah dan di kerjakan','Diambil dan di tulis','Di halaman dan di kerjakan'],a:1,e:'Di rumah adalah kata depan yang ditulis terpisah, sedangkan ditulis adalah awalan di- yang dirangkai.'},
{q:'Nilai berita yang menunjukkan kedekatan lokasi suatu peristiwa dengan pembaca disebut ....',o:['Prominence','Conflict','Proximity','Unusualness','Human interest'],a:2,e:'Proximity adalah kedekatan geografis atau emosional.'},
{q:'Tujuan utama penyuntingan teks berita adalah ....',o:['Mengubah seluruh fakta agar lebih menarik','Menambahkan opini pribadi penulis','Memperbaiki ketepatan informasi dan penggunaan bahasa','Menghilangkan semua keterangan narasumber','Memperpanjang berita sebanyak mungkin'],a:2,e:'Penyuntingan bertujuan memastikan ketepatan isi, bahasa, ejaan, dan kelengkapan berita.'}
];
let current = 0;
const answers = {};
let submitted = false;
const letters = ['A','B','C','D','E'];
function renderQuestion(){
  const q = questions[current];
  $('#questionCounter').textContent = `Soal ${current+1} dari ${questions.length}`;
  $('#answeredCounter').textContent = `${Object.keys(answers).length} dijawab`;
  $('#quizProgress').style.width = `${Object.keys(answers).length/questions.length*100}%`;
  $('#quizContainer').innerHTML = `<div class="question-card"><h3>${current+1}. ${q.q}</h3>${q.o.map((opt,i)=>`<label class="option ${answers[current]===i?'selected':''}"><input type="radio" name="answer" value="${i}" ${answers[current]===i?'checked':''} ${submitted?'disabled':''}><span><b>${letters[i]}.</b> ${opt}</span></label>`).join('')}</div>`;
  $$('.option', $('#quizContainer')).forEach((label,i)=>label.addEventListener('click',()=>{
    if(submitted)return;
    answers[current]=i;renderQuestion();
  }));
  $('#prevQuestion').disabled = current===0;
  $('#nextQuestion').textContent = current===questions.length-1 ? 'Kembali ke awal ↺' : 'Berikutnya →';
  $('#nextQuestion').disabled = submitted;
}
$('#prevQuestion').addEventListener('click',()=>{if(current>0){current--;renderQuestion();}});
$('#nextQuestion').addEventListener('click',()=>{current=current===questions.length-1?0:current+1;renderQuestion();});
$('#submitQuiz').addEventListener('click',()=>{
  if(submitted)return;
  if(Object.keys(answers).length!==questions.length){$('#quizHint').textContent='Masih ada soal yang belum dijawab. Lengkapi semua jawaban terlebih dahulu.';return;}
  submitted=true;
  const score=questions.filter((q,i)=>answers[i]===q.a).length;
  const percent=Math.round(score/questions.length*100);
  const result=$('#quizResult');
  result.hidden=false;
  result.innerHTML=`<div class="result-score">${percent}</div><b>Nilai kamu: ${score} dari ${questions.length} soal benar</b><p>${score>=13?'Sangat baik! Pemahaman materi berita sudah kuat.':score>=10?'Bagus! Pelajari kembali bagian yang masih salah.':'Tetap semangat. Ulangi rangkuman dan pelajari pembahasannya.'}</p><div>${questions.map((q,i)=>`<div class="review-item"><b class="${answers[i]===q.a?'correct-text':'wrong-text'}">${i+1}. ${answers[i]===q.a?'✓ Benar':'✗ Belum tepat'} — Jawaban ${letters[q.a]}</b><span>${q.e}</span></div>`).join('')}</div><button class="btn btn-primary" id="retryQuiz">Ulangi latihan</button>`;
  $('#quizHint').textContent='Hasil latihan dan pembahasan ditampilkan di bawah.';
  $('#submitQuiz').disabled=true;
  $('#nextQuestion').disabled=true;
  $('#prevQuestion').disabled=true;
  $('#retryQuiz').addEventListener('click',()=>{
    Object.keys(answers).forEach(k=>delete answers[k]);
    current=0;submitted=false;result.hidden=true;$('#submitQuiz').disabled=false;$('#quizHint').textContent='Jawab seluruh soal untuk melihat nilai dan pembahasan.';renderQuestion();
    $('#latihan').scrollIntoView({behavior:'smooth'});
  });
  result.scrollIntoView({behavior:'smooth',block:'start'});
});
renderQuestion();
