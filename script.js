// Shine Boyz Record Studio - Version Professionnelle Complète

class ShineBoyzStudio {
    constructor() {
        this.state = {
            isRecording: false,
            isPlaying: false,
            audioBlob: null,
            audioUrl: null,
            selectedStyle: 'afrobeat',
            generatedBeat: null,
            currentProject: null,
            userLoggedIn: false,
            recordingTime: 0,
            recordingTimer: null,
            projects: [],
            mediaRecorder: null,
            audioChunks: [],
            audioContext: null,
            analyser: null,
            microphone: null,
            dataArray: null,
            currentTime: 0,
            isGenerating: false
        };

        this.audioElements = {
            player: null,
            preview: null,
            final: null,
            demo: null
        };

        this.waveforms = {
            main: null,
            preview: null,
            final: null
        };

        this.init();
    }

    async init() {
        console.log('🎵 Shine Boyz Studio - Initialisation');
        
        // Cache les éléments audio pour référence
        this.audioElements.player = document.getElementById('audioPlayer');
        this.audioElements.preview = document.getElementById('previewAudio');
        this.audioElements.final = document.getElementById('finalAudio');
        this.audioElements.demo = document.getElementById('demoAudio');
        
        // Initialiser les visualiseurs
        this.createVisualizerBars();
        
        // Charger les styles
        this.loadStyles();
        
        // Charger les projets
        this.loadProjects();
        
        // Configurer l'interface
        this.setupEventListeners();
        
        // Initialiser l'audio (avec permission)
        await this.initAudio();
        
        // Masquer l'écran de chargement
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
        }, 1500);
        
        console.log('✅ Studio prêt à l\'emploi');
    }

    async initAudio() {
        try {
            // Vérifier la compatibilité
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('API microphone non supportée');
                this.showNotification('Votre navigateur ne supporte pas l\'enregistrement audio', 'error');
                return;
            }

            // Demander la permission en arrière-plan
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            // Initialiser le contexte audio
            this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.state.analyser = this.state.audioContext.createAnalyser();
            
            // Configurer l'analyseur
            this.state.analyser.fftSize = 256;
            const bufferLength = this.state.analyser.frequencyBinCount;
            this.state.dataArray = new Uint8Array(bufferLength);
            
            // Connecter le microphone
            this.state.microphone = this.state.audioContext.createMediaStreamSource(stream);
            this.state.microphone.connect(this.state.analyser);
            
            // Arrêter temporairement
            stream.getTracks().forEach(track => track.stop());
            
            console.log('✅ Audio initialisé');
            
        } catch (error) {
            console.error('Erreur initialisation audio:', error);
            this.showNotification('Accès microphone non autorisé. Veuillez autoriser l\'accès dans les paramètres.', 'warning');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                
                // Mettre à jour l'état actif
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Menu mobile
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                const navList = document.querySelector('.nav-list');
                navList.classList.toggle('active');
            });
        }

        // Enregistrement
        document.getElementById('recordBtn').addEventListener('click', () => this.startRecording());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('playBtn').addEventListener('click', () => this.playRecording());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearRecording());
        
        // Génération IA
        document.getElementById('generateBtn').addEventListener('click', () => this.generateInstrumental());
        document.getElementById('generateVariationBtn').addEventListener('click', () => this.generateVariation());
        document.getElementById('analyzeVocalBtn').addEventListener('click', () => this.analyzeVocal());
        
        // Import de fichiers
        document.getElementById('browseFilesBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
        const importZone = document.getElementById('importZone');
        importZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            importZone.classList.add('dragover');
        });

        importZone.addEventListener('dragleave', () => {
            importZone.classList.remove('dragover');
        });

        importZone.addEventListener('drop', (e) => {
            e.preventDefault();
            importZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Mixage
        document.querySelectorAll('.volume-fader').forEach(fader => {
            fader.addEventListener('input', (e) => {
                const value = e.target.value;
                const valueElement = document.getElementById(e.target.id + 'Value');
                if (valueElement) {
                    valueElement.textContent = `${value} dB`;
                }
            });
        });

        document.getElementById('masterBtn').addEventListener('click', () => this.applyMastering());
        document.getElementById('analyzeMixBtn').addEventListener('click', () => this.analyzeMix());

        // Présets mastering
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyMasteringPreset(btn.dataset.preset);
            });
        });

        // Outils IA
        document.querySelectorAll('.ai-tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.runAITool(btn.dataset.tool);
            });
        });

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTrack());
        
        // Formats d'export
        document.querySelectorAll('.format-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.format-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                this.updateExportFormat(option.dataset.format);
            });
        });

        // Partage
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.shareTrack(btn.dataset.platform);
            });
        });

        // Démo
        document.getElementById('demoBtn').addEventListener('click', () => this.playDemo());
        document.getElementById('startRecordingBtn').addEventListener('click', () => {
            this.scrollToSection('record');
            setTimeout(() => {
                document.getElementById('recordBtn').click();
            }, 500);
        });

        // Compte
        document.getElementById('accountBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.state.userLoggedIn) {
                this.scrollToSection('account');
            } else {
                document.getElementById('loginModal').classList.add('active');
            }
        });

        // Fermer modals
        document.getElementById('closeLoginModal').addEventListener('click', () => {
            document.getElementById('loginModal').classList.remove('active');
        });

        // Connexion
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Sliders
        document.getElementById('bpmRange').addEventListener('input', (e) => {
            document.getElementById('bpmValue').textContent = `${e.target.value} BPM`;
        });

        document.getElementById('energyRange').addEventListener('input', (e) => {
            document.getElementById('energyValue').textContent = `${e.target.value}/10`;
        });

        document.getElementById('loudnessRange').addEventListener('input', (e) => {
            document.getElementById('loudnessValue').textContent = `${e.target.value} LUFS`;
        });

        // Lecture preview
        document.getElementById('playPreviewBtn').addEventListener('click', () => this.togglePreviewPlayback());
        document.getElementById('playFinalBtn').addEventListener('click', () => this.toggleFinalPlayback());

        // Window events
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        // Mettre à jour le timer visuel
        setInterval(() => {
            if (this.state.isRecording) {
                this.state.recordingTime++;
                this.updateRecordingTimer();
                this.updateAudioVisualizer();
            }
        }, 1000);
    }

    async startRecording() {
        if (this.state.isRecording) return;

        try {
            // Obtenir l'accès au microphone
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            // Initialiser MediaRecorder
            this.state.mediaRecorder = new MediaRecorder(stream);
            this.state.audioChunks = [];

            // Écouter les données
            this.state.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.state.audioChunks.push(event.data);
                }
            };

            // Quand l'enregistrement s'arrête
            this.state.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/webm' });
                this.state.audioBlob = audioBlob;
                this.state.audioUrl = URL.createObjectURL(audioBlob);
                
                // Mettre à jour l'interface
                this.updateRecordingUI(false);
                this.drawWaveform();
                
                // Arrêter le stream
                stream.getTracks().forEach(track => track.stop());
                
                this.showNotification('Enregistrement terminé avec succès!', 'success');
            };

            // Démarrer l'enregistrement
            this.state.mediaRecorder.start(100); // Chunks de 100ms
            this.state.isRecording = true;
            this.state.recordingTime = 0;
            
            // Mettre à jour l'interface
            this.updateRecordingUI(true);
            this.showNotification('Enregistrement démarré. Parlez maintenant!', 'success');

            // Démarrer la visualisation
            this.startAudioVisualization(stream);

        } catch (error) {
            console.error('Erreur enregistrement:', error);
            this.showNotification('Erreur d\'accès au microphone', 'error');
        }
    }

    stopRecording() {
        if (!this.state.isRecording || !this.state.mediaRecorder) return;

        this.state.mediaRecorder.stop();
        this.state.isRecording = false;
        this.updateRecordingUI(false);
    }

    startAudioVisualization(stream) {
        // Créer un contexte audio pour la visualisation
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const animate = () => {
            if (!this.state.isRecording) {
                // Nettoyer
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();
                return;
            }

            analyser.getByteFrequencyData(dataArray);
            
            // Mettre à jour le visualiseur
            const visualizer = document.getElementById('audioVisualizer');
            const bars = visualizer.querySelectorAll('.visual-bar');
            
            bars.forEach((bar, index) => {
                const dataIndex = Math.floor(index * dataArray.length / bars.length);
                const value = dataArray[dataIndex] || 0;
                const height = 20 + (value / 255 * 80);
                bar.style.height = `${height}%`;
                
                // Couleur dynamique
                const hue = 200 + (value / 255 * 160);
                bar.style.background = `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(${hue + 20}, 100%, 60%))`;
            });

            // Mettre à jour les niveaux
            this.updateMeterLevels(dataArray);

            requestAnimationFrame(animate);
        };

        animate();
    }

    updateMeterLevels(dataArray) {
        if (!dataArray) return;

        // Calculer le niveau RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const normalizedValue = dataArray[i] / 255;
            sum += normalizedValue * normalizedValue;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const db = rms > 0 ? 20 * Math.log10(rms) : -60;
        const normalizedDb = Math.max(-60, Math.min(0, db));

        // Mettre à jour les indicateurs
        const percentage = ((normalizedDb + 60) / 60) * 100;
        
        const inputLevel = document.getElementById('inputLevel');
        const outputLevel = document.getElementById('outputLevel');
        const inputLevelText = document.getElementById('inputLevelText');
        const outputLevelText = document.getElementById('outputLevelText');

        if (inputLevel) inputLevel.style.width = `${percentage}%`;
        if (outputLevel) outputLevel.style.width = `${percentage}%`;
        if (inputLevelText) inputLevelText.textContent = `${normalizedDb.toFixed(1)} dB`;
        if (outputLevelText) outputLevelText.textContent = `${normalizedDb.toFixed(1)} dB`;
    }

    playRecording() {
        if (!this.state.audioUrl) {
            this.showNotification('Aucun enregistrement à écouter', 'warning');
            return;
        }

        const audioPlayer = this.audioElements.player;
        const playBtn = document.getElementById('playBtn');

        if (this.state.isPlaying) {
            audioPlayer.pause();
            this.state.isPlaying = false;
            playBtn.innerHTML = '<i class="fas fa-play"></i> Écouter';
        } else {
            audioPlayer.src = this.state.audioUrl;
            audioPlayer.play();
            this.state.isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';

            audioPlayer.onended = () => {
                this.state.isPlaying = false;
                playBtn.innerHTML = '<i class="fas fa-play"></i> Écouter';
            };
        }
    }

    clearRecording() {
        this.state.audioBlob = null;
        this.state.audioUrl = null;
        this.state.isPlaying = false;

        const audioPlayer = this.audioElements.player;
        audioPlayer.src = '';

        // Réinitialiser l'interface
        document.getElementById('recordingTimer').textContent = '00:00';
        document.getElementById('statusText').textContent = 'Prêt à enregistrer';
        document.getElementById('statusIndicator').style.backgroundColor = '#00ff88';
        document.getElementById('playBtn').disabled = true;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Écouter';

        // Effacer le waveform
        const canvas = document.getElementById('waveformCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Réinitialiser le visualiseur
        const visualizer = document.getElementById('audioVisualizer');
        const bars = visualizer.querySelectorAll('.visual-bar');
        bars.forEach(bar => {
            bar.style.height = '20%';
            bar.style.background = 'linear-gradient(to top, var(--primary), var(--secondary))';
        });

        this.showNotification('Enregistrement effacé', 'info');
    }

    updateRecordingUI(isRecording) {
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

    updateRecordingTimer() {
        const minutes = Math.floor(this.state.recordingTime / 60);
        const seconds = this.state.recordingTime % 60;
        document.getElementById('recordingTimer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    createVisualizerBars() {
        const visualizer = document.getElementById('audioVisualizer');
        if (!visualizer) return;

        visualizer.innerHTML = '';
        for (let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'visual-bar';
            bar.style.height = `${20 + Math.random() * 60}%`;
            visualizer.appendChild(bar);
        }
    }

    updateAudioVisualizer() {
        const visualizer = document.getElementById('audioVisualizer');
        const bars = visualizer.querySelectorAll('.visual-bar');
        
        bars.forEach(bar => {
            const newHeight = 20 + Math.random() * 80;
            bar.style.height = `${newHeight}%`;
            
            const hue = 200 + Math.random() * 160;
            bar.style.background = `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(${hue + 20}, 100%, 60%))`;
        });
    }

    drawWaveform() {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Effacer
        ctx.clearRect(0, 0, width, height);

        // Dessiner un waveform simulé
        ctx.fillStyle = 'rgba(255, 77, 0, 0.2)';
        ctx.strokeStyle = '#ff4d00';
        ctx.lineWidth = 2;

        ctx.beginPath();
        const centerY = height / 2;

        for (let x = 0; x < width; x += 2) {
            const amplitude = Math.sin(x * 0.05) * Math.sin(x * 0.01) * (height / 3);
            const y = centerY + amplitude;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Remplir
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }

    loadStyles() {
        const styles = [
            { id: 'mbalax', name: 'M\'balax', icon: 'fas fa-drum', color: '#ff6b6b' },
            { id: 'acoustic', name: 'Acoustic Guitar', icon: 'fas fa-guitar', color: '#4ecdc4' },
            { id: 'peulh', name: 'African Peulh', icon: 'fas fa-globe-africa', color: '#45b7d1' },
            { id: 'afrobeat', name: 'Afrobeat', icon: 'fas fa-music', color: '#96ceb4' },
            { id: 'drill', name: 'Drill', icon: 'fas fa-drum-steelpan', color: '#feca57' },
            { id: 'rnb', name: 'RnB', icon: 'fas fa-heart', color: '#ff9ff3' },
            { id: 'hiphop', name: 'Hip-Hop', icon: 'fas fa-microphone-alt', color: '#54a0ff' },
            { id: 'trap', name: 'Trap', icon: 'fas fa-sliders-h', color: '#5f27cd' },
            { id: 'salsa', name: 'Salsa', icon: 'fas fa-music', color: '#ff9f43' }
        ];

        const stylesGrid = document.getElementById('stylesGrid');
        if (!stylesGrid) return;

        stylesGrid.innerHTML = '';

        styles.forEach(style => {
            const styleElement = document.createElement('div');
            styleElement.className = 'style-option';
            styleElement.dataset.style = style.id;
            styleElement.innerHTML = `
                <div class="style-icon" style="color: ${style.color}">
                    <i class="${style.icon}"></i>
                </div>
                <span>${style.name}</span>
            `;

            styleElement.addEventListener('click', () => {
                document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
                styleElement.classList.add('active');
                this.state.selectedStyle = style.id;
                this.showNotification(`Style sélectionné: ${style.name}`, 'info');
            });

            stylesGrid.appendChild(styleElement);
        });

        // Sélectionner le premier par défaut
        if (stylesGrid.firstChild) {
            stylesGrid.firstChild.classList.add('active');
        }
    }

    async generateInstrumental() {
        if (!this.state.audioUrl && !this.state.selectedStyle) {
            this.showNotification('Veuillez d\'abord enregistrer une voix ou sélectionner un style', 'warning');
            return;
        }

        this.state.isGenerating = true;
        this.showNotification('Génération de l\'instrumental IA en cours...', 'info');

        // Afficher la modal de traitement IA
        const modal = document.getElementById('aiProcessingModal');
        const aiStatus = document.getElementById('aiStatus');
        modal.classList.add('active');

        // Simuler le processus IA
        const steps = [
            'Analyse de votre voix...',
            'Détection du BPM et tonalité...',
            'Création du beat IA...',
            'Synchronisation avec le vocal...',
            'Optimisation du mix...'
        ];

        for (let i = 0; i < steps.length; i++) {
            aiStatus.textContent = steps[i];
            
            // Mettre à jour les étapes de progression
            const statusSteps = document.querySelectorAll('.status-step');
            statusSteps.forEach((step, index) => {
                if (index <= i) {
                    step.classList.add('active');
                    step.querySelector('.step-check').innerHTML = '<i class="fas fa-check"></i>';
                }
            });

            await this.delay(1000); // 1 seconde entre chaque étape
        }

        // Créer le beat généré
        this.state.generatedBeat = {
            id: `beat_${Date.now()}`,
            name: `Beat ${this.state.selectedStyle.toUpperCase()} Shine Boyz`,
            style: this.state.selectedStyle,
            bpm: parseInt(document.getElementById('bpmRange').value),
            energy: parseInt(document.getElementById('energyRange').value),
            duration: parseInt(document.getElementById('durationSelect').value),
            created: new Date().toISOString()
        };

        // Afficher l'aperçu
        this.showPreview();
        
        // Fermer la modal
        modal.classList.remove('active');
        
        // Réinitialiser les étapes
        const statusSteps = document.querySelectorAll('.status-step');
        statusSteps.forEach((step, index) => {
            if (index > 0) {
                step.classList.remove('active');
                step.querySelector('.step-check').textContent = index + 1;
            }
        });

        this.state.isGenerating = false;
        this.showNotification('Instrumental IA généré avec succès!', 'success');
    }

    generateVariation() {
        if (!this.state.generatedBeat) {
            this.showNotification('Générez d\'abord un instrumental', 'warning');
            return;
        }

        this.showNotification('Création d\'une variante IA...', 'info');
        
        setTimeout(() => {
            this.state.generatedBeat.name += ' (Variante)';
            this.showPreview();
            this.showNotification('Variante générée!', 'success');
        }, 2000);
    }

    showPreview() {
        const placeholder = document.getElementById('previewPlaceholder');
        const player = document.getElementById('previewPlayer');

        if (!placeholder || !player) return;

        placeholder.style.display = 'none';
        player.style.display = 'block';

        // Mettre à jour les informations
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('totalTime').textContent = '3:00';

        // Dessiner un waveform pour l'aperçu
        this.drawPreviewWaveform();
    }

    drawPreviewWaveform() {
        const canvas = document.getElementById('previewCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Dessiner un waveform plus intéressant
        ctx.fillStyle = 'rgba(0, 179, 255, 0.2)';
        ctx.strokeStyle = '#00b3ff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        const centerY = height / 2;

        for (let x = 0; x < width; x += 2) {
            const t = x / width * Math.PI * 8;
            const amplitude = (
                Math.sin(t) * 0.5 +
                Math.sin(t * 2.7) * 0.3 +
                Math.sin(t * 7.3) * 0.2
            ) * (height / 3);

            const y = centerY + amplitude;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
    }

    togglePreviewPlayback() {
        const btn = document.getElementById('playPreviewBtn');
        const icon = btn.querySelector('i');
        const demoAudio = this.audioElements.demo;

        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            demoAudio.play();
            this.showNotification('Lecture de l\'aperçu', 'info');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            demoAudio.pause();
            this.showNotification('Aperçu en pause', 'info');
        }
    }

    toggleFinalPlayback() {
        const btn = document.getElementById('playFinalBtn');
        const icon = btn.querySelector('i');
        const demoAudio = this.audioElements.demo; // Utiliser la démo pour la simulation

        if (icon.classList.contains('fa-play')) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            demoAudio.play();
            this.showNotification('Lecture du morceau final', 'info');
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            demoAudio.pause();
            this.showNotification('Morceau en pause', 'info');
        }
    }

    applyMastering() {
        this.showNotification('Application du mastering IA...', 'info');
        
        // Simuler le mastering
        setTimeout(() => {
            // Mettre à jour les indicateurs
            document.querySelectorAll('.effect-status').forEach(status => {
                status.innerHTML = '<i class="fas fa-check"></i>';
                status.classList.add('active');
            });

            // Mettre à jour le niveau master
            document.getElementById('masterLevel').style.height = '85%';
            
            this.showNotification('Mastering IA appliqué! Qualité professionnelle garantie.', 'success');
        }, 3000);
    }

    analyzeMix() {
        this.showNotification('Analyse du mix en cours...', 'info');
        
        setTimeout(() => {
            const analysis = {
                loudness: -14.2,
                peak: -1.5,
                dynamicRange: 9.8,
                stereoWidth: 75,
                balance: 'Excellent',
                recommendations: ['Augmenter légèrement les aigus sur la voix', 'Réduire le volume de la basse de 2dB']
            };
            
            this.showNotification(
                `Analyse terminée: ${analysis.loudness} LUFS, Dynamic Range: ${analysis.dynamicRange}dB`, 
                'success'
            );
        }, 2000);
    }

    applyMasteringPreset(preset) {
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
            case 'club':
                loudnessRange.value = -6;
                break;
        }
        
        document.getElementById('loudnessValue').textContent = `${loudnessRange.value} LUFS`;
        this.showNotification(`Préset "${preset}" appliqué`, 'info');
    }

    async exportTrack() {
        if (!this.state.generatedBeat && !this.state.audioUrl) {
            this.showNotification('Créez d\'abord un morceau à exporter', 'warning');
            return;
        }

        // Afficher la modal d'exportation
        const modal = document.getElementById('exportModal');
        const progressFill = document.getElementById('exportProgressFill');
        const progressText = document.getElementById('exportProgressText');
        const exportStatus = document.getElementById('exportStatus');
        
        modal.classList.add('active');

        // Simuler le processus d'exportation
        const steps = [
            { percent: 25, text: 'Préparation de l\'exportation...' },
            { percent: 50, text: 'Encodage audio en cours...' },
            { percent: 75, text: 'Génération des métadonnées...' },
            { percent: 90, text: 'Création du fichier final...' },
            { percent: 100, text: 'Exportation terminée!' }
        ];

        for (const step of steps) {
            progressFill.style.width = `${step.percent}%`;
            progressText.textContent = `${step.percent}%`;
            exportStatus.textContent = step.text;
            
            await this.delay(800);
        }

        // Créer et télécharger un fichier simulé
        await this.delay(1000);
        
        // Créer un fichier audio simulé
        const trackName = document.getElementById('trackNameInput').value || 'shine-boyz-track';
        const artistName = document.getElementById('artistNameInput').value || 'Artiste Shine Boyz';
        
        // Créer un blob de données simulé (dans une vraie app, ce serait l'audio réel)
        const content = `Morceau: ${trackName}\nArtiste: ${artistName}\nStyle: ${this.state.selectedStyle}\nBPM: ${this.state.generatedBeat?.bpm || 120}\nDate: ${new Date().toLocaleDateString()}\n\nExporté avec Shine Boyz Record Studio IA`;
        const blob = new Blob([content], { type: 'text/plain' });
        
        // Créer un lien de téléchargement
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${trackName.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Fermer la modal après un délai
        setTimeout(() => {
            modal.classList.remove('active');
            
            // Réinitialiser la progression
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            
            this.showNotification('Morceau exporté avec succès!', 'success');
        }, 1500);
    }

    updateExportFormat(format) {
        const trackFormat = document.getElementById('trackFormat');
        if (!trackFormat) return;

        switch(format) {
            case 'wav':
                trackFormat.textContent = 'WAV 24-bit';
                break;
            case 'mp3':
                trackFormat.textContent = 'MP3 320kbps';
                break;
            case 'flac':
                trackFormat.textContent = 'FLAC';
                break;
            case 'aac':
                trackFormat.textContent = 'AAC 256kbps';
                break;
        }
    }

    shareTrack(platform) {
        const platforms = {
            whatsapp: 'WhatsApp',
            instagram: 'Instagram',
            telegram: 'Telegram',
            tiktok: 'TikTok',
            email: 'Email',
            cloud: 'Cloud Shine Boyz'
        };

        this.showNotification(`Partage sur ${platforms[platform]} en préparation...`, 'info');
        
        setTimeout(() => {
            this.showNotification(`Morceau partagé sur ${platforms[platform]}!`, 'success');
        }, 1500);
    }

    handleFileUpload(file) {
        if (!file) return;

        // Vérifier le type de fichier
        const validTypes = ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/mpeg'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Format de fichier non supporté', 'error');
            return;
        }

        // Lire le fichier
        const reader = new FileReader();
        reader.onload = (e) => {
            const audioData = e.target.result;
            
            // Créer un objet audio
            const importedAudio = {
                id: `import_${Date.now()}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                file: file,
                data: audioData,
                type: 'imported',
                importedAt: new Date().toISOString()
            };

            this.showNotification(`"${importedAudio.name}" importé avec succès`, 'success');
            
            // Si c'est un instrumental, le traiter comme un beat généré
            if (file.name.toLowerCase().includes('beat') || file.name.toLowerCase().includes('instrumental')) {
                this.state.generatedBeat = {
                    id: `imported_${Date.now()}`,
                    name: importedAudio.name,
                    style: 'imported',
                    imported: true,
                    duration: 180
                };
                this.showPreview();
            }
        };

        reader.readAsDataURL(file);
    }

    analyzeVocal() {
        if (!this.state.audioUrl) {
            this.showNotification('Enregistrez d\'abord une voix', 'warning');
            return;
        }

        this.showNotification('Analyse du vocal en cours...', 'info');
        
        // Simuler l'analyse
        setTimeout(() => {
            const bpm = Math.floor(Math.random() * 40) + 80; // BPM aléatoire entre 80-120
            document.getElementById('bpmRange').value = bpm;
            document.getElementById('bpmValue').textContent = `${bpm} BPM`;
            
            this.showNotification(`BPM détecté: ${bpm}, Tonalité: C# mineur`, 'success');
        }, 2000);
    }

    runAITool(tool) {
        const tools = {
            separate: 'Séparation voix/instrumental',
            recompose: 'Recomposition IA',
            enhance: 'Amélioration qualité',
            transcribe: 'Transcription paroles'
        };

        this.showNotification(`${tools[tool]} en cours...`, 'info');
        
        // Simuler le traitement IA
        setTimeout(() => {
            this.showNotification(`${tools[tool]} terminé avec succès!`, 'success');
        }, 3000);
    }

    playDemo() {
        const demoAudio = this.audioElements.demo;
        
        if (demoAudio.paused) {
            demoAudio.play();
            this.showNotification('Démo en lecture', 'info');
            
            // Simuler la génération pour la démo
            setTimeout(() => {
                this.state.generatedBeat = {
                    id: 'demo_beat',
                    name: 'Beat Démo Shine Boyz',
                    style: 'afrobeat',
                    bpm: 120,
                    duration: 180
                };
                this.showPreview();
            }, 1000);
        } else {
            demoAudio.pause();
            this.showNotification('Démo arrêtée', 'info');
        }
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Veuillez remplir tous les champs', 'warning');
            return;
        }

        // Simuler la connexion
        const user = {
            name: 'Artiste Shine Boyz',
            email: email,
            joinDate: '2024-01-01',
            subscription: 'Pro'
        };

        localStorage.setItem('shineBoyzUser', JSON.stringify(user));
        this.state.userLoggedIn = true;

        // Mettre à jour l'interface
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('loginForm').reset();

        this.showNotification('Connexion réussie! Bienvenue dans le studio.', 'success');
        
        // Mettre à jour le bouton compte
        const accountBtn = document.getElementById('accountBtn');
        accountBtn.innerHTML = '<i class="fas fa-user-check"></i> Compte Pro';
    }

    loadProjects() {
        // Charger depuis localStorage ou utiliser des données de démo
        const savedProjects = localStorage.getItem('shineBoyzProjects');
        if (savedProjects) {
            this.state.projects = JSON.parse(savedProjects);
        } else {
            // Données de démo
            this.state.projects = [
                {
                    id: 1,
                    title: 'Nouvelle Étoile',
                    date: '2024-01-15',
                    status: 'completed',
                    duration: '3:45',
                    bpm: 120,
                    style: 'afrobeat'
                },
                {
                    id: 2,
                    title: 'Rêves d\'Afrique',
                    date: '2024-01-10',
                    status: 'in-progress',
                    duration: '2:30',
                    bpm: 110,
                    style: 'mbalax'
                },
                {
                    id: 3,
                    title: 'Shine Tonight',
                    date: '2024-01-05',
                    status: 'completed',
                    duration: '4:20',
                    bpm: 95,
                    style: 'rnb'
                }
            ];
        }

        this.updateProjectsGrid();
    }

    updateProjectsGrid() {
        const projectsGrid = document.getElementById('projectsGrid');
        if (!projectsGrid) return;

        projectsGrid.innerHTML = '';

        this.state.projects.forEach(project => {
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
                    <span><i class="fas fa-music"></i> ${project.style}</span>
                </div>
            `;

            projectCard.addEventListener('click', () => {
                this.loadProject(project.id);
            });

            projectsGrid.appendChild(projectCard);
        });

        // Mettre à jour le compteur
        document.getElementById('projectsCount').textContent = this.state.projects.length;
    }

    loadProject(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (project) {
            this.showNotification(`Chargement de "${project.title}"...`, 'info');
            
            // Simuler le chargement
            setTimeout(() => {
                this.state.currentProject = project;
                this.showNotification(`Projet "${project.title}" chargé`, 'success');
            }, 1000);
        }
    }

    // Utilitaires
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        if (!notification || !notificationText) return;

        // Définir la couleur
        let backgroundColor, icon;
        switch(type) {
            case 'success':
                backgroundColor = '#00ff88';
                icon = 'fa-check-circle';
                break;
            case 'warning':
                backgroundColor = '#ffaa00';
                icon = 'fa-exclamation-triangle';
                break;
            case 'error':
                backgroundColor = '#ff3366';
                icon = 'fa-exclamation-circle';
                break;
            case 'info':
            default:
                backgroundColor = '#00b3ff';
                icon = 'fa-info-circle';
                break;
        }

        notification.style.background = backgroundColor;
        notification.querySelector('i').className = `fas ${icon}`;
        notificationText.textContent = message;

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Service Worker pour PWA
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker enregistré:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker erreur:', error);
                });
        }
    }
}

// Initialiser l'application
window.addEventListener('load', () => {
    window.shineBoyzStudio = new ShineBoyzStudio();
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW enregistré:', registration);
            })
            .catch(error => {
                console.log('SW erreur:', error);
            });
    });
}
