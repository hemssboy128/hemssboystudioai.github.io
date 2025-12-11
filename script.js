// Application Shine Boyz Record - JavaScript

// État global de l'application
const appState = {
    isRecording: false,
    isPlaying: false,
    audioBlob: null,
    audioUrl: null,
    selectedStyle: null,
    generatedBeat: null,
    currentProject: null,
    userLoggedIn: false,
    recordingTime: 0,
    recordingTimer: null,
    projects: []
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    createVisualizerBars();
    loadStyles();
    loadProjects();
    simulateAudioVisualizer();
});

// Initialisation
function initializeApp() {
    // Vérifier si l'utilisateur est connecté
    const user = localStorage.getItem('shineBoyzUser');
    if (user) {
        appState.userLoggedIn = true;
        updateUserInfo(JSON.parse(user));
    }
    
    // Initialiser les canvas
    initializeCanvas();
    
    // Mettre à jour les compteurs
    updateStorageInfo();
    
    // Afficher la version
    console.log('Shine Boyz Record Studio IA v1.0.0');
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Menu mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navList = document.querySelector('.nav-list');
            navList.classList.toggle('active');
        });
    }
    
    // Enregistrement audio
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (recordBtn) {
        recordBtn.addEventListener('click', startRecording);
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', stopRecording);
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', playRecording);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearRecording);
    }
    
    // Génération IA
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateInstrumental);
    }
    
    const generateVariationBtn = document.getElementById('generateVariationBtn');
    if (generateVariationBtn) {
        generateVariationBtn.addEventListener('click', generateVariation);
    }
    
    // Contrôles du mixage
    document.querySelectorAll('.volume-fader').forEach(fader => {
        fader.addEventListener('input', updateFaderValue);
    });
    
    const masterBtn = document.getElementById('masterBtn');
    if (masterBtn) {
        masterBtn.addEventListener('click', applyMastering);
    }
    
    const analyzeMixBtn = document.getElementById('analyzeMixBtn');
    if (analyzeMixBtn) {
        analyzeMixBtn.addEventListener('click', analyzeMix);
    }
    
    // Présets de mastering
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            applyMasteringPreset(this.dataset.preset);
        });
    });
    
    // Exportation
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTrack);
    }
    
    // Formats d'exportation
    document.querySelectorAll('.format-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.format-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            updateExportFormat(this.dataset.format);
        });
    });
    
    // Partage
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            shareTrack(this.classList[1]); // whatsapp, instagram, etc.
        });
    });
    
    // Modal de connexion
    const accountBtn = document.querySelector('.account-btn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');
    const showRegister = document.getElementById('showRegister');
    
    if (accountBtn) {
        accountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (appState.userLoggedIn) {
                scrollToSection('account');
            } else {
                loginModal.classList.add('active');
            }
        });
    }
    
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            loginModal.classList.remove('active');
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Fonctionnalité d\'inscription à venir!', 'info');
        });
    }
    
    // Fermer la modal en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
    
    // Démarrage rapide
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    if (startRecordingBtn) {
        startRecordingBtn.addEventListener('click', function() {
            scrollToSection('record');
            setTimeout(() => {
                if (recordBtn) recordBtn.click();
            }, 500);
        });
    }
    
    // Contrôles de zoom du waveform
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const fitWaveformBtn = document.getElementById('fitWaveformBtn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomWaveform(1.2));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomWaveform(0.8));
    if (fitWaveformBtn) fitWaveformBtn.addEventListener('click', fitWaveform);
    
    // Sliders
    const bpmRange = document.getElementById('bpmRange');
    const energyRange = document.getElementById('energyRange');
    const loudnessRange = document.getElementById('loudnessRange');
    
    if (bpmRange) bpmRange.addEventListener('input', updateBpmValue);
    if (energyRange) energyRange.addEventListener('input', updateEnergyValue);
    if (loudnessRange) loudnessRange.addEventListener('input', updateLoudnessValue);
    
    // Joueurs audio
    const playPreviewBtn = document.getElementById('playPreviewBtn');
    const playFinalBtn = document.getElementById('playFinalBtn');
    
    if (playPreviewBtn) playPreviewBtn.addEventListener('click', togglePreviewPlayback);
    if (playFinalBtn) playFinalBtn.addEventListener('click', toggleFinalPlayback);
    
    // Nouveau projet
    const newProjectBtn = document.querySelector('.btn-new-project');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', createNewProject);
    }
}

// Fonctions de l'application

// Enregistrement audio
function startRecording() {
    if (appState.isRecording) return;
    
    appState.isRecording = true;
    appState.recordingTime = 0;
    
    // Mettre à jour l'interface
    updateRecordingUI(true);
    
    // Simuler l'enregistrement (dans une vraie app, utiliser l'API Web Audio)
    appState.recordingTimer = setInterval(() => {
        appState.recordingTime++;
        updateRecordingTimer();
        updateAudioVisualizer();
        updateMeterLevels();
    }, 1000);
    
    showNotification('Enregistrement démarré', 'success');
}

function stopRecording() {
    if (!appState.isRecording) return;
    
    appState.isRecording = false;
    clearInterval(appState.recordingTimer);
    
    // Simuler la création d'un blob audio
    appState.audioBlob = new Blob(['simulated audio data'], { type: 'audio/wav' });
    appState.audioUrl = URL.createObjectURL(appState.audioBlob);
    
    // Mettre à jour l'interface
    updateRecordingUI(false);
    drawWaveform();
    
    showNotification('Enregistrement terminé', 'success');
}

function playRecording() {
    if (!appState.audioUrl) return;
    
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = appState.audioUrl;
    
    if (appState.isPlaying) {
        audioPlayer.pause();
        appState.isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i> Écouter';
    } else {
        audioPlayer.play();
        appState.isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        audioPlayer.onended = function() {
            appState.isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Écouter';
        };
    }
}

function clearRecording() {
    appState.audioBlob = null;
    appState.audioUrl = null;
    appState.isPlaying = false;
    
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = '';
    
    // Réinitialiser l'interface
    document.getElementById('recordingTimer').textContent = '00:00';
    document.getElementById('statusText').textContent = 'Prêt à enregistrer';
    document.getElementById('statusIndicator').style.backgroundColor = '#00ff88';
    document.getElementById('playBtn').disabled = true;
    
    // Effacer le waveform
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    showNotification('Enregistrement effacé', 'info');
}

// Génération instrumentale IA
function generateInstrumental() {
    if (!appState.audioUrl && !appState.selectedStyle) {
        showNotification('Veuillez d\'abord enregistrer une voix et sélectionner un style', 'warning');
        return;
    }
    
    showNotification('Génération de l\'instrumental en cours...', 'info');
    
    // Simuler la génération IA
    simulateGenerationProcess();
    
    // Après un délai, afficher l'aperçu
    setTimeout(() => {
        appState.generatedBeat = {
            name: 'Beat Shine Boyz',
            duration: 180, // 3 minutes
            bpm: parseInt(document.getElementById('bpmRange').value),
            style: appState.selectedStyle
        };
        
        showPreview();
        showNotification('Instrumental généré avec succès!', 'success');
    }, 3000);
}

function generateVariation() {
    if (!appState.generatedBeat) return;
    
    showNotification('Création d\'une variante...', 'info');
    
    setTimeout(() => {
        showNotification('Variante générée!', 'success');
        // Dans une vraie app, on chargerait une nouvelle version
    }, 2000);
}

// Mixage et mastering
function applyMastering() {
    showNotification('Application du mastering Shine Boyz Quality...', 'info');
    
    setTimeout(() => {
        showNotification('Mastering appliqué! Qualité Spotify/Apple Music prête.', 'success');
        
        // Mettre à jour les indicateurs
        document.querySelectorAll('.effect-status').forEach(status => {
            status.innerHTML = '<i class="fas fa-check"></i>';
            status.classList.add('active');
        });
    }, 2500);
}

function analyzeMix() {
    showNotification('Analyse du mix en cours...', 'info');
    
    setTimeout(() => {
        const analysis = {
            loudness: -14.2,
            peak: -1.5,
            dynamicRange: 9.8,
            stereoWidth: 75
        };
        
        showNotification(`Analyse terminée: ${analysis.loudness} LUFS, ${analysis.dynamicRange} dB de range`, 'success');
    }, 1500);
}

// Exportation
function exportTrack() {
    if (!appState.generatedBeat) {
        showNotification('Veuillez d\'abord générer un instrumental', 'warning');
        return;
    }
    
    const exportModal = document.getElementById('exportModal');
    const exportProgressFill = document.getElementById('exportProgressFill');
    const exportProgressText = document.getElementById('exportProgressText');
    const exportStatus = document.getElementById('exportStatus');
    
    exportModal.classList.add('active');
    
    // Simuler le processus d'exportation
    let progress = 0;
    const steps = [
        'Préparation de l\'exportation...',
        'Encodage audio en cours...',
        'Génération des métadonnées...',
        'Finalisation du fichier...',
        'Exportation terminée!'
    ];
    
    const exportInterval = setInterval(() => {
        progress += 25;
        exportProgressFill.style.width = `${progress}%`;
        exportProgressText.textContent = `${progress}%`;
        
        const stepIndex = Math.floor(progress / 25);
        if (stepIndex < steps.length) {
            exportStatus.textContent = steps[stepIndex];
            
            // Mettre à jour les étapes
            const exportSteps = document.querySelectorAll('.export-step');
            exportSteps.forEach((step, index) => {
                if (index < stepIndex) {
                    step.innerHTML = '<i class="fas fa-check"></i>';
                    step.classList.add('active');
                } else if (index === stepIndex) {
                    step.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                }
            });
        }
        
        if (progress >= 100) {
            clearInterval(exportInterval);
            
            setTimeout(() => {
                exportModal.classList.remove('active');
                showNotification('Morceau exporté avec succès!', 'success');
                
                // Réinitialiser la progression
                setTimeout(() => {
                    exportProgressFill.style.width = '0%';
                    exportProgressText.textContent = '0%';
                    document.querySelectorAll('.export-step').forEach(step => {
                        step.innerHTML = '<i class="far fa-circle"></i>';
                        step.classList.remove('active');
                    });
                }, 500);
            }, 1000);
        }
    }, 500);
}

// Interface utilisateur
function updateRecordingUI(isRecording) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    
    if (isRecording) {
        statusIndicator.style.backgroundColor = '#ff3366';
        statusIndicator.style.animation = 'pulse 1s infinite';
        statusText.textContent = 'Enregistrement en cours...';
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        playBtn.disabled = true;
    } else {
        statusIndicator.style.backgroundColor = '#00ff88';
        statusIndicator.style.animation = 'none';
        statusText.textContent = 'Enregistrement terminé';
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        playBtn.disabled = false;
    }
}

function updateRecordingTimer() {
    const minutes = Math.floor(appState.recordingTime / 60);
    const seconds = appState.recordingTime % 60;
    const timerElement = document.getElementById('recordingTimer');
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateAudioVisualizer() {
    const visualizer = document.getElementById('audioVisualizer');
    const bars = visualizer.querySelectorAll('.visual-bar');
    
    bars.forEach(bar => {
        const newHeight = 20 + Math.random() * 80;
        bar.style.height = `${newHeight}%`;
        
        // Ajouter un effet de couleur aléatoire
        const hue = 200 + Math.random() * 160;
        bar.style.background = `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(${hue + 20}, 100%, 50%))`;
    });
}

function updateMeterLevels() {
    const inputLevel = document.getElementById('inputLevel');
    const outputLevel = document.getElementById('outputLevel');
    const inputLevelText = document.getElementById('inputLevelText');
    const outputLevelText = document.getElementById('outputLevelText');
    
    // Simuler des niveaux audio aléatoires
    const inputDb = -30 + Math.random() * 40;
    const outputDb = -40 + Math.random() * 35;
    
    inputLevel.style.width = `${Math.max(0, (inputDb + 60) / 60 * 100)}%`;
    outputLevel.style.width = `${Math.max(0, (outputDb + 60) / 60 * 100)}%`;
    
    inputLevelText.textContent = `${inputDb.toFixed(1)} dB`;
    outputLevelText.textContent = `${outputDb.toFixed(1)} dB`;
}

// Styles musicaux
function loadStyles() {
    const styles = [
        { id: 'mbalax', name: 'M\'balax', icon: 'fas fa-drum' },
        { id: 'acoustic', name: 'Acoustic Guitar', icon: 'fas fa-guitar' },
        { id: 'peulh', name: 'African Peulh', icon: 'fas fa-globe-africa' },
        { id: 'afrobeat', name: 'Afrobeat', icon: 'fas fa-music' },
        { id: 'drill', name: 'Drill', icon: 'fas fa-drum-steelpan' },
        { id: 'rnb', name: 'RnB', icon: 'fas fa-heart' },
        { id: 'hiphop', name: 'Hip-Hop', icon: 'fas fa-microphone-alt' },
        { id: 'trap', name: 'Trap', icon: 'fas fa-sliders-h' },
        { id: 'salsa', name: 'Salsa', icon: 'fas fa-music' }
    ];
    
    const stylesGrid = document.getElementById('stylesGrid');
    if (!stylesGrid) return;
    
    stylesGrid.innerHTML = '';
    
    styles.forEach(style => {
        const styleElement = document.createElement('div');
        styleElement.className = 'style-option';
        styleElement.dataset.style = style.id;
        styleElement.innerHTML = `
            <div class="style-icon">
                <i class="${style.icon}"></i>
            </div>
            <span>${style.name}</span>
        `;
        
        styleElement.addEventListener('click', function() {
            document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            appState.selectedStyle = style.id;
            showNotification(`Style sélectionné: ${style.name}`, 'info');
        });
        
        stylesGrid.appendChild(styleElement);
    });
}

// Aperçu de l'instrumental
function showPreview() {
    const placeholder = document.getElementById('previewPlaceholder');
    const player = document.getElementById('previewPlayer');
    
    if (placeholder && player) {
        placeholder.style.display = 'none';
        player.style.display = 'block';
        
        // Mettre à jour les infos
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('totalTime').textContent = '3:00';
        
        // Simuler un waveform
        drawPreviewWaveform();
    }
}

// Canvas et visualisation
function initializeCanvas() {
    // Initialiser les canvas pour les waveforms
    const canvases = ['waveformCanvas', 'previewCanvas', 'finalCanvas'];
    canvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    });
}

function drawWaveform() {
    const canvas = document.getElementById('waveformCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dessiner un waveform simulé
    ctx.fillStyle = 'rgba(255, 77, 0, 0.3)';
    ctx.strokeStyle = '#ff4d00';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    const centerY = height / 2;
    
    for (let x = 0; x < width; x += 2) {
        const amplitude = Math.sin(x * 0.05 + Date.now() * 0.001) * 
                         Math.sin(x * 0.01) * 
                         (height / 3);
        const y = centerY + amplitude;
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Remplir l'aire sous la courbe
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

function drawPreviewWaveform() {
    const canvas = document.getElementById('previewCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dessiner un waveform plus complexe pour l'instrumental
    ctx.fillStyle = 'rgba(0, 179, 255, 0.2)';
    ctx.strokeStyle = '#00b3ff';
    ctx.lineWidth = 2;
    
    // Courbe principale
    ctx.beginPath();
    const centerY = height / 2;
    
    for (let x = 0; x < width; x += 2) {
        const t = x / width * Math.PI * 4;
        const amplitude = (
            Math.sin(t) * 0.6 +
            Math.sin(t * 2.3) * 0.3 +
            Math.sin(t * 5.7) * 0.1
        ) * (height / 3);
        
        const y = centerY + amplitude;
        
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    
    // Remplir l'aire sous la courbe
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
}

// Utilitaires
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop - 80,
            behavior: 'smooth'
        });
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    // Définir la couleur selon le type
    let backgroundColor;
    switch(type) {
        case 'success': backgroundColor = '#00ff88'; break;
        case 'warning': backgroundColor = '#ffaa00'; break;
        case 'error': backgroundColor = '#ff3366'; break;
        case 'info': backgroundColor = '#00b3ff'; break;
        default: backgroundColor = '#00ff88';
    }
    
    notification.style.background = backgroundColor;
    notificationText.textContent = message;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function createVisualizerBars() {
    const visualizer = document.getElementById('audioVisualizer');
    if (!visualizer) return;
    
    for (let i = 0; i < 32; i++) {
        const bar = document.createElement('div');
        bar.className = 'visual-bar';
        bar.style.height = `${20 + Math.random() * 60}%`;
        visualizer.appendChild(bar);
    }
}

function simulateAudioVisualizer() {
    setInterval(() => {
        if (appState.isRecording || appState.isPlaying) {
            updateAudioVisualizer();
        }
    }, 100);
}

function simulateGenerationProcess() {
    const statusSteps = document.querySelectorAll('.status-step');
    
    statusSteps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
            step.querySelector('.step-check').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            if (index === statusSteps.length - 1) {
                setTimeout(() => {
                    step.querySelector('.step-check').innerHTML = '<i class="fas fa-check"></i>';
                }, 1000);
            }
        }, index * 800);
    });
}

// Gestion des projets
function loadProjects() {
    // Charger les projets depuis le localStorage ou simuler
    appState.projects = [
        { id: 1, title: 'Nouvelle Étoile', date: '2023-10-15', status: 'completed', duration: '3:45', bpm: 120 },
        { id: 2, title: 'Rêves d\'Afrique', date: '2023-10-10', status: 'in-progress', duration: '2:30', bpm: 110 },
        { id: 3, title: 'Shine Tonight', date: '2023-10-05', status: 'completed', duration: '4:20', bpm: 95 },
        { id: 4, title: 'Urban Vibes', date: '2023-10-01', status: 'completed', duration: '3:15', bpm: 140 }
    ];
    
    updateProjectsGrid();
}

function updateProjectsGrid() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    projectsGrid.innerHTML = '';
    
    appState.projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-header">
                <div>
                    <h4 class="project-title">${project.title}</h4>
                    <p class="project-date">${project.date}</p>
                </div>
                <span class="project-status ${project.status}">
                    ${project.status === 'completed' ? 'Terminé' : 'En cours'}
                </span>
            </div>
            <div class="project-stats">
                <span><i class="fas fa-clock"></i> ${project.duration}</span>
                <span><i class="fas fa-tachometer-alt"></i> ${project.bpm} BPM</span>
                <span><i class="fas fa-waveform"></i> Mixé</span>
            </div>
        `;
        
        projectCard.addEventListener('click', function() {
            loadProject(project.id);
        });
        
        projectsGrid.appendChild(projectCard);
    });
}

function createNewProject() {
    const newProject = {
        id: appState.projects.length + 1,
        title: `Projet ${appState.projects.length + 1}`,
        date: new Date().toISOString().split('T')[0],
        status: 'in-progress',
        duration: '0:00',
        bpm: 120
    };
    
    appState.projects.unshift(newProject);
    updateProjectsGrid();
    updateProjectsCount();
    
    showNotification('Nouveau projet créé', 'success');
}

function loadProject(projectId) {
    const project = appState.projects.find(p => p.id === projectId);
    if (project) {
        showNotification(`Chargement de "${project.title}"...`, 'info');
        // Dans une vraie app, charger les données du projet
    }
}

function updateProjectsCount() {
    const countElement = document.getElementById('projectsCount');
    if (countElement) {
        countElement.textContent = appState.projects.length;
    }
}

function updateStorageInfo() {
    const storageProgress = document.getElementById('storageProgress');
    const storageText = document.getElementById('storageText');
    
    if (storageProgress && storageText) {
        const used = 3.2; // Go
        const total = 10; // Go
        const percentage = (used / total) * 100;
        
        storageProgress.style.width = `${percentage}%`;
        storageText.textContent = `${used.toFixed(1)} Go sur ${total} Go utilisés`;
    }
}

// Connexion utilisateur
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validation simple
    if (!email || !password) {
        showNotification('Veuillez remplir tous les champs', 'warning');
        return;
    }
    
    // Simuler la connexion
    const user = {
        name: 'Artiste Shine Boyz',
        email: email,
        joinDate: '2023-01-15'
    };
    
    localStorage.setItem('shineBoyzUser', JSON.stringify(user));
    appState.userLoggedIn = true;
    
    updateUserInfo(user);
    
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginForm').reset();
    
    showNotification('Connexion réussie! Bienvenue sur Shine Boyz Record', 'success');
    
    // Rediriger vers la section compte
    setTimeout(() => scrollToSection('account'), 500);
}

function updateUserInfo(user) {
    const accountName = document.getElementById('accountName');
    const accountEmail = document.getElementById('accountEmail');
    
    if (accountName) accountName.textContent = user.name;
    if (accountEmail) accountEmail.textContent = user.email;
    
    // Mettre à jour le bouton de compte
    const accountBtn = document.querySelector('.account-btn');
    if (accountBtn) {
        accountBtn.innerHTML = '<i class="fas fa-user-check"></i> Mon Compte';
    }
}

// Fonctions de contrôle
function updateFaderValue(e) {
    const fader = e.target;
    const valueElement = document.getElementById(fader.id + 'Value');
    if (valueElement) {
        const dbValue = parseInt(fader.value);
        valueElement.textContent = `${dbValue} dB`;
    }
}

function updateBpmValue(e) {
    const valueElement = document.getElementById('bpmValue');
    if (valueElement) {
        valueElement.textContent = `${e.target.value} BPM`;
    }
}

function updateEnergyValue(e) {
    const valueElement = document.getElementById('energyValue');
    if (valueElement) {
        valueElement.textContent = `${e.target.value}/10`;
    }
}

function updateLoudnessValue(e) {
    const valueElement = document.getElementById('loudnessValue');
    if (valueElement) {
        valueElement.textContent = `${e.target.value} LUFS`;
    }
}

function updateExportFormat(format) {
    const trackFormat = document.getElementById('trackFormat');
    if (trackFormat) {
        switch(format) {
            case 'wav': trackFormat.textContent = 'WAV 24-bit'; break;
            case 'mp3': trackFormat.textContent = 'MP3 320kbps'; break;
            case 'flac': trackFormat.textContent = 'FLAC'; break;
        }
    }
}

function applyMasteringPreset(preset) {
    const loudnessRange = document.getElementById('loudnessRange');
    
    switch(preset) {
        case 'shine-boyz':
            loudnessRange.value = -14;
            break;
        case 'spotify':
            loudnessRange.value = -14;
            break;
        case 'apple':
            loudnessRange.value = -16;
            break;
        case 'radio':
            loudnessRange.value = -9;
            break;
    }
    
    updateLoudnessValue({ target: loudnessRange });
    showNotification(`Préset "${preset}" appliqué`, 'info');
}

function zoomWaveform(factor) {
    // Dans une vraie app, implémenter le zoom du waveform
    showNotification(`Zoom ${factor > 1 ? 'agrandi' : 'réduit'}`, 'info');
}

function fitWaveform() {
    showNotification('Waveform ajusté à l\'écran', 'info');
}

function togglePreviewPlayback() {
    const btn = document.getElementById('playPreviewBtn');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        showNotification('Lecture de l\'aperçu', 'info');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        showNotification('Aperçu en pause', 'info');
    }
}

function toggleFinalPlayback() {
    const btn = document.getElementById('playFinalBtn');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('fa-play')) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
        showNotification('Lecture du morceau final', 'info');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
        showNotification('Morceau en pause', 'info');
    }
}

function shareTrack(platform) {
    const platforms = {
        whatsapp: 'WhatsApp',
        instagram: 'Instagram',
        telegram: 'Telegram',
        email: 'Email'
    };
    
    showNotification(`Partage sur ${platforms[platform]} en préparation...`, 'info');
    
    // Dans une vraie app, utiliser les APIs de partage
    setTimeout(() => {
        showNotification(`Morceau partagé sur ${platforms[platform]}!`, 'success');
    }, 1500);
}

// Initialisation CSS supplémentaire
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .fa-spinner {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);