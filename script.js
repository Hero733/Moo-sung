// --- คำเตือนด้านความปลอดภัย ---
// โค้ดนี้ใช้ localStorage ในการเก็บข้อมูลผู้ใช้ ซึ่งไม่ปลอดภัย!
// ในแอปพลิเคชันจริง การล็อกอินและข้อมูลโปรไฟล์ควรถูกเก็บในเซิร์ฟเวอร์ที่ปลอดภัย
// เพื่อป้องกันการเข้าถึงจากบุคคลภายนอกและแฮ็กเกอร์
// โค้ดนี้ถูกออกแบบมาเพื่อการศึกษาและการสาธิตเท่านั้น

// ตัวแปรสำหรับเกม
let selectedQuestions = [];
let currentQuestionIndex = 0;
let hearts = 3;
let score = 0;
let currentUser = null;

// URL รูปภาพตัวละคร (เปลี่ยนมาใช้รูปภาพจากโฟลเดอร์ photo)
const characterImages = {
    'A': 'photo/C1.png',
    'B': 'photo/C2.png',
    'C': 'photo/C3.png'
};

// --- ฟังก์ชันการนำทางและจัดการผู้ใช้ ---

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
    
    if (profiles[username] && profiles[username].password === password) {
        currentUser = profiles[username];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        alert("เข้าสู่ระบบสำเร็จ!");
        window.location.href = 'home.html';
    } else {
        alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
}

function createAccount() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const profiles = JSON.parse(localStorage.getItem('profiles')) || {};

    if (!username || !password || !confirmPassword) {
        alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return;
    }
    if (password !== confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        return;
    }
    if (profiles[username]) {
        alert("ชื่อผู้ใช้นี้มีอยู่แล้ว");
        return;
    }

    profiles[username] = { 
        username: username, 
        password: password, 
        wins: 0, 
        losses: 0,
        // กำหนด URL ของรูปภาพเริ่มต้นให้เป็นรูปภาพแรก
        avatarUrl: characterImages['A']
    };
    localStorage.setItem('profiles', JSON.stringify(profiles));
    alert("สร้างบัญชีสำเร็จ! ยินดีต้อนรับสู่เกม");
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('currentUser');
    alert("ออกจากระบบเรียบร้อย");
    window.location.href = 'index.html';
}

function changeUsername() {
    const newUsername = document.getElementById('new-username').value.trim();
    if (!newUsername) {
        alert("กรุณากรอกชื่อผู้ใช้ใหม่");
        return;
    }
    
    let profiles = JSON.parse(localStorage.getItem('profiles'));
    currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (profiles[newUsername]) {
        alert("ชื่อผู้ใช้มีอยู่แล้ว");
        return;
    }
    
    profiles[newUsername] = { ...profiles[currentUser.username], username: newUsername };
    delete profiles[currentUser.username];
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    currentUser = profiles[newUsername];
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateProfileDisplays();
    alert("เปลี่ยนชื่อผู้ใช้สำเร็จ");
}

function changePassword() {
    const currentPassword = document.getElementById('current-password-change').value.trim();
    const newPassword = document.getElementById('new-password-change').value.trim();
    
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.password !== currentPassword) {
        alert("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        return;
    }
    
    const profiles = JSON.parse(localStorage.getItem('profiles'));
    profiles[currentUser.username].password = newPassword;
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    alert("เปลี่ยนรหัสผ่านสำเร็จ");
}

function updateProfileDisplays() {
    const profileNameElements = document.querySelectorAll('.profile-name-display');
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));

    if (loggedInUser) {
        profileNameElements.forEach(el => el.textContent = loggedInUser.username);
    }
}

// --- ฟังก์ชันการเล่นเกม ---

function startGame() {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    const selectedCharacter = localStorage.getItem('selectedCharacter');
    if (!loggedInUser || !selectedCharacter) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('character-display').src = characterImages[selectedCharacter];

    selectedQuestions = [];
    for (let i = 0; i < 20; i++) {
        selectedQuestions.push(generateStatsQuestion());
    }
    shuffle(selectedQuestions);

    currentQuestionIndex = 0;
    hearts = 3;
    score = 0;
    
    updateStatus();
    nextQuestion();
}

function nextQuestion() {
    if (currentQuestionIndex < selectedQuestions.length) {
        const currentQ = selectedQuestions[currentQuestionIndex];
        document.getElementById('question-text').innerText = `(${currentQuestionIndex + 1}/20) ${currentQ.q}`;
        document.getElementById('answer-input').value = '';
        document.getElementById('message').innerText = '';
        document.getElementById('answer-input').focus();
    } else {
        endGame(true);
    }
}

function checkAnswer() {
    const userAnswer = document.getElementById('answer-input').value.trim();
    const currentQ = selectedQuestions[currentQuestionIndex];
    const userAnswerNum = parseFloat(userAnswer);
    const correctAnswerNum = parseFloat(currentQ.a);
    const messageEl = document.getElementById('message');

    if (!isNaN(userAnswerNum) && userAnswerNum === correctAnswerNum) {
        messageEl.innerText = "ถูกต้อง!";
        messageEl.className = 'correct';
        score++;
        currentQuestionIndex++;
        setTimeout(() => {
            updateStatus();
            nextQuestion();
        }, 1000);
    } else {
        messageEl.innerText = "ผิด! ลองใหม่อีกครั้ง";
        messageEl.className = 'incorrect';
        hearts--;
        updateStatus();
        if (hearts <= 0) {
            setTimeout(() => endGame(false), 1000);
        }
    }
}

function updateStatus() {
    document.getElementById('hearts-counter').innerText = hearts;
    document.getElementById('score-counter').innerText = score;
}

function endGame(isWin) {
    let profiles = JSON.parse(localStorage.getItem('profiles'));
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (isWin) {
        profiles[currentUser.username].wins++;
        document.getElementById('end-message').innerText = "ยินดีด้วย! คุณชนะแล้ว!";
    } else {
        profiles[currentUser.username].losses++;
        document.getElementById('end-message').innerText = "เกมโอเวอร์! คุณหัวใจหมดแล้ว";
    }
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'flex';
}

// --- ฟังก์ชันเสริมสำหรับสถิติและอื่นๆ ---

function renderLeaderboard() {
    const profiles = Object.values(JSON.parse(localStorage.getItem('profiles')) || {});
    profiles.sort((a, b) => b.wins - a.wins);

    const tableBody = document.querySelector('#leaderboard-table tbody');
    tableBody.innerHTML = ''; 

    profiles.forEach((profile, index) => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = index + 1;
        row.insertCell(1).innerText = profile.username;
        row.insertCell(2).innerText = profile.wins;
        row.insertCell(3).innerText = profile.losses;
    });
}

function generateStatsQuestion() {
    const data = [];
    const numCount = Math.floor(Math.random() * (15 - 5 + 1)) + 5; 
    for (let i = 0; i < numCount; i++) {
        data.push(Math.floor(Math.random() * 100) + 1); 
    }
    data.sort((a, b) => a - b);

    const questionType = ['min', 'max', 'q1', 'q2', 'q3'][Math.floor(Math.random() * 5)];
    let answer;
    let questionText;

    const minVal = data[0];
    const maxVal = data[data.length - 1];
    const q1Val = calculateQuartile(data, (data.length + 1) / 4);
    const q2Val = calculateQuartile(data, (data.length + 1) / 2);
    const q3Val = calculateQuartile(data, 3 * (data.length + 1) / 4);

    switch (questionType) {
        case 'min':
            questionText = `ชุดข้อมูล: ${data.join(', ')} - ค่าน้อยที่สุดคืออะไร?`;
            answer = minVal;
            break;
        case 'max':
            questionText = `ชุดข้อมูล: ${data.join(', ')} - ค่ามากที่สุดคืออะไร?`;
            answer = maxVal;
            break;
        case 'q1':
            questionText = `ชุดข้อมูล: ${data.join(', ')} - Q1 คืออะไร?`;
            answer = q1Val;
            break;
        case 'q2':
            questionText = `ชุดข้อมูล: ${data.join(', ')} - Q2 (มัธยฐาน) คืออะไร?`;
            answer = q2Val;
            break;
        case 'q3':
            questionText = `ชุดข้อมูล: ${data.join(', ')} - Q3 คืออะไร?`;
            answer = q3Val;
            break;
    }

    return { q: questionText, a: String(answer.toFixed(2)) };
}

function calculateQuartile(arr, index) {
    const floorIndex = Math.floor(index);
    const ceilingIndex = Math.ceil(index);

    if (floorIndex === ceilingIndex) {
        return arr[floorIndex - 1];
    } else {
        const lowerValue = arr[floorIndex - 1];
        const upperValue = arr[ceilingIndex - 1];
        const interpolation = index - floorIndex;
        return lowerValue + interpolation * (upperValue - lowerValue);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}
