// --- คำเตือนด้านความปลอดภัย ---
// โค้ดนี้ใช้ localStorage ในการเก็บข้อมูลผู้ใช้ ซึ่งไม่ปลอดภัย!
// ในแอปพลิเคชันจริง การล็อกอินและข้อมูลโปรไฟล์ควรถูกเก็บในเซิร์ฟเวอร์ที่ปลอดภัย
// เพื่อป้องกันการเข้าถึงจากบุคคลภายนอกและแฮ็กเกอร์
// โค้ดนี้ถูกออกแบบมาเพื่อการศึกษาและการสาธิตเท่านั้น

// URL สำหรับ API ของเซิร์ฟเวอร์ (คุณต้องเปลี่ยนเป็น URL จริงของคุณ)
const API_URL = 'https://your-server.com/api';

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

// --- ฟังก์ชันการนำทางและจัดการผู้ใช้ (ที่ถูกแก้ไขแล้ว) ---

async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert("เข้าสู่ระบบสำเร็จ!");
            window.location.href = 'home.html';
        } else {
            alert(data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }
    } catch (error) {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
}

async function createAccount() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (password !== confirmPassword) {
        return alert("รหัสผ่านไม่ตรงกัน");
    }

    if (username.length < 3) {
        return alert("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (response.ok) {
            alert("สร้างบัญชีสำเร็จ!");
            window.location.href = 'index.html';
        } else {
            alert(data.message || "เกิดข้อผิดพลาดในการสร้างบัญชี");
        }
    } catch (error) {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
}

async function changeUsername() {
    const newUsername = document.getElementById('new-username').value.trim();
    if (!currentUser) return alert('โปรดเข้าสู่ระบบก่อน');
    
    try {
        const response = await fetch(`${API_URL}/change-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                oldUsername: currentUser.username, 
                newUsername 
            })
        });
        const data = await response.json();

        if (response.ok) {
            currentUser.username = newUsername;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateProfileDisplays();
            alert("เปลี่ยนชื่อผู้ใช้สำเร็จ");
        } else {
            alert(data.message || "เกิดข้อผิดพลาดในการเปลี่ยนชื่อผู้ใช้");
        }
    } catch (error) {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password-change').value.trim();
    const newPassword = document.getElementById('new-password-change').value.trim();
    if (!currentUser) return alert('โปรดเข้าสู่ระบบก่อน');
    
    try {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: currentUser.username,
                currentPassword,
                newPassword
            })
        });
        const data = await response.json();

        if (response.ok) {
            alert("เปลี่ยนรหัสผ่านสำเร็จ");
        } else {
            alert(data.message || "รหัสผ่านปัจจุบันไม่ถูกต้อง");
        }
    } catch (error) {
        alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedCharacter');
    currentUser = null;
    window.location.href = 'index.html';
}

function updateProfileDisplays() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const profileNameElements = document.querySelectorAll('.profile-name-display');
    profileNameElements.forEach(el => {
        el.textContent = currentUser ? currentUser.username : "ผู้เยี่ยมชม";
    });

    const characterDisplay = document.getElementById('character-display');
    const selectedCharacter = localStorage.getItem('selectedCharacter');
    if (characterDisplay && selectedCharacter && characterImages[selectedCharacter]) {
        characterDisplay.src = characterImages[selectedCharacter];
    }
}

// --- ฟังก์ชันการเล่นเกมและกระดานจัดอันดับ (ที่ถูกแก้ไขแล้ว) ---

async function endGame() {
    if (!currentUser) {
        alert("โปรดเข้าสู่ระบบเพื่อบันทึกคะแนน");
        return;
    }
    
    const messageElement = document.getElementById('end-message');
    let win = false;
    
    if (score >= 20) {
        messageElement.textContent = "เยี่ยมมาก! คุณชนะแล้ว!";
        messageElement.style.color = 'var(--success-green)';
        win = true;
    } else {
        messageElement.textContent = `คุณทำคะแนนได้ ${score} คะแนน แต่ยังไม่ถึงเป้าหมาย!`;
        messageElement.style.color = 'var(--danger-red)';
    }

    // ส่งคะแนนไปที่เซิร์ฟเวอร์
    try {
        await fetch(`${API_URL}/end-game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser.username,
                score,
                win
            })
        });
    } catch (error) {
        console.error("Failed to send game result to server:", error);
    }
}

async function renderLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/leaderboard`);
        const leaderboardData = await response.json();
        
        const tableBody = document.querySelector('#leaderboard-table tbody');
        tableBody.innerHTML = ''; // ล้างข้อมูลเก่า
        
        if (leaderboardData.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 4;
            cell.textContent = "ยังไม่มีข้อมูลกระดานจัดอันดับ";
            cell.style.textAlign = 'center';
            return;
        }

        leaderboardData.forEach((player, index) => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.username}</td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
            `;
        });
    } catch (error) {
        console.error("Failed to fetch leaderboard from server:", error);
        const tableBody = document.querySelector('#leaderboard-table tbody');
        tableBody.innerHTML = '';
        const row = tableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = "ไม่สามารถโหลดกระดานจัดอันดับได้";
        cell.style.color = 'var(--danger-red)';
        cell.style.textAlign = 'center';
    }
}

// --- ฟังก์ชันสำหรับเกม (ไม่ได้แก้ไข) ---

function getNextQuestion() {
    if (selectedQuestions.length === 0 || currentQuestionIndex >= selectedQuestions.length) {
        endGame();
        return;
    }
    const question = selectedQuestions[currentQuestionIndex];
    document.getElementById('question-text').textContent = question.q;
    document.getElementById('answer-input').value = '';
    document.getElementById('message').textContent = '';
    document.getElementById('answer-input').focus();
    updateHeartsDisplay();
    updateScoreDisplay();
}

function checkAnswer() {
    const answerInput = document.getElementById('answer-input').value.trim();
    const messageElement = document.getElementById('message');
    const question = selectedQuestions[currentQuestionIndex];
    const correctAnswer = question.a;

    if (answerInput === correctAnswer) {
        messageElement.textContent = "ถูกต้อง!";
        messageElement.style.color = 'var(--success-green)';
        score++;
        currentQuestionIndex++;
        
        setTimeout(() => {
            if (score >= 20) {
                endGame();
            } else {
                getNextQuestion();
            }
        }, 1000);
        
    } else {
        messageElement.textContent = "คำตอบไม่ถูกต้อง ลองอีกครั้ง";
        messageElement.style.color = 'var(--danger-red)';
        hearts--;
        updateHeartsDisplay();
        
        if (hearts <= 0) {
            endGame();
        }
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}

function startGame() {
    // โหลดชุดคำถามจากไฟล์ json
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            selectedQuestions = shuffle(data).slice(0, 20);
            currentQuestionIndex = 0;
            hearts = 3;
            score = 0;
            getNextQuestion();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            alert('ไม่สามารถโหลดคำถามได้');
        });
}

function updateHeartsDisplay() {
    document.getElementById('hearts-counter').textContent = hearts;
}

function updateScoreDisplay() {
    document.getElementById('score-counter').textContent = score;
}

// ฟังก์ชันอื่นๆ ไม่ได้แก้ไข
// ... (code for generateRandomData, getQuestion, calculateQuartile, shuffle) ...

function generateRandomData(size, range) {
    const data = [];
    for (let i = 0; i < size; i++) {
        data.push(Math.floor(Math.random() * range) + 1);
    }
    return data;
}

function getQuestion() {
    const questionTypes = ['min', 'max', 'q1', 'q2', 'q3'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    const data = generateRandomData(5, 100).sort((a, b) => a - b);
    let questionText = '';
    let answer = '';

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const q1Val = calculateQuartile(data, (data.length + 1) / 4);
    const q2Val = calculateQuartile(data, (data.length + 1) / 2);
    const q3Val = calculateQuartile(data, 3 * (data.length + 1) / 4);

    switch (type) {
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
