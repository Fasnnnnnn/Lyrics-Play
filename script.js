document.addEventListener('DOMContentLoaded', function() {
    const mvFile = document.getElementById('mvFile');
    const audioFile = document.getElementById('audioFile');
    const videoPreview = document.getElementById('videoPreview');
    const audioPreviewPlayer = document.getElementById('audioPreviewPlayer');
    const lrcFile = document.getElementById('lrcFile');
    const lrcPreview = document.getElementById('lrcPreview');
    const generateBtn = document.getElementById('generateBtn');
    const ktvSection = document.querySelector('.ktv-section');
    const calibrationSection = document.querySelector('.calibration-section');
    const ktvVideo = document.getElementById('ktvVideo');
    const calibrationVideo = document.getElementById('calibrationVideo');
    const lyricsDisplay = document.getElementById('lyricsDisplay');
    const lyricsPosition = document.getElementById('lyricsPosition');
    const glowEffect = document.getElementById('glowEffect');
    const timeAdjustBtn = document.getElementById('timeAdjustBtn');
    const timeAdjustValue = document.getElementById('timeAdjustValue');
    const applyTimeAdjustBtn = document.getElementById('applyTimeAdjustBtn');
    const backBtn = document.getElementById('backBtn');
    const resetFontSize = document.getElementById('resetFontSize');
    const fontSizeInput = document.getElementById('fontSize');
    const lyricsCol = document.getElementById('lyricsCol');
    const lyricsContainer = document.querySelector('.lyrics-container');
    
    // 默认字体大小值
    const DEFAULT_FONT_SIZE = 14;

    let originalLyrics = [];
    let adjustedLyrics = [];

    // 设置视频默认音量为30%
    ktvVideo.addEventListener('loadedmetadata', function() {
        ktvVideo.volume = 0.3;
    });

    calibrationVideo.addEventListener('loadedmetadata', function() {
        calibrationVideo.volume = 0.3;
    });

    videoPreview.addEventListener('loadedmetadata', function() {
        videoPreview.volume = 0.3;
    });

    audioPreviewPlayer.addEventListener('loadedmetadata', function() {
        audioPreviewPlayer.volume = 0.3;
    });

    // 视频加载后调整尺寸
    ktvVideo.addEventListener('loadedmetadata', function() {
        const videoAspectRatio = this.videoWidth / this.videoHeight;
        const maxWidth = document.querySelector('.col-md-8').offsetWidth;
        const videoHeight = maxWidth / videoAspectRatio;
        
        // 设视频容器高度
        this.style.width = '100%';
        this.style.height = videoHeight + 'px';
        
        // 调整歌词容器高度
        lyricsContainer.style.height = videoHeight + 'px';
    });

    // 窗口大小改变时重新调整
    window.addEventListener('resize', function() {
        if (ktvVideo.videoWidth) {
            const videoAspectRatio = ktvVideo.videoWidth / ktvVideo.videoHeight;
            const maxWidth = document.querySelector('.col-md-8').offsetWidth;
            const videoHeight = maxWidth / videoAspectRatio;
            
            ktvVideo.style.height = videoHeight + 'px';
            lyricsContainer.style.height = videoHeight + 'px';
        }
    });

    // MV文件上传预览
    mvFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            videoPreview.src = url;
            videoPreview.style.display = 'block';
        }
    });

    // 歌词文件上传预览
    lrcFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                lrcPreview.textContent = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    // 解析LRC格式词
    function parseLRC(lrc) {
        const lines = lrc.split('\n');
        const lyrics = [];
        
        lines.forEach(line => {
            const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
            const matches = line.match(timeRegex);
            
            if (matches) {
                const text = line.replace(timeRegex, '').trim();
                matches.forEach(match => {
                    const time = match.slice(1, -1).split(':');
                    const seconds = parseInt(time[0]) * 60 + parseFloat(time[1]);
                    lyrics.push({
                        time: seconds,
                        text: text
                    });
                });
            }
        });

        return lyrics.sort((a, b) => a.time - b.time);
    }

    // 生成KTV效果
    generateBtn.addEventListener('click', function() {
        if ((!mvFile.files[0] && !audioFile.files[0]) || !lrcFile.files[0]) {
            alert('请先上传视频/音频和歌词文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            originalLyrics = parseLRC(e.target.result);
            displayLyrics(originalLyrics);
            // 设置视频源为视频文件或音频文件
            if (mvFile.files[0]) {
                ktvVideo.src = URL.createObjectURL(mvFile.files[0]);
            } else if (audioFile.files[0]) {
                ktvVideo.src = URL.createObjectURL(audioFile.files[0]);
            }
            ktvSection.style.display = 'block';
        };
        reader.readAsText(lrcFile.files[0]);
    });

    // 显示歌词
    function displayLyrics(lyrics) {
        lyricsDisplay.innerHTML = '';
        const fontSize = document.getElementById('fontSize').value;
        const fontColor = document.getElementById('fontColor').value;
        const textAlign = lyricsPosition.value;

        lyrics.forEach((lyric, index) => {
            const div = document.createElement('div');
            div.className = 'lyrics-line';
            div.textContent = lyric.text;
            div.dataset.time = lyric.time;
            div.style.fontSize = fontSize + 'px';
            div.style.color = fontColor;
            div.style.textAlign = textAlign;
            lyricsDisplay.appendChild(div);
        });

        // 如果启用了荧光效果，添加相应的类
        if (glowEffect.checked) {
            lyricsDisplay.parentElement.classList.add('glow-enabled');
        }

        // 监听��频播放进度更新歌词高亮
        ktvVideo.addEventListener('timeupdate', function() {
            const currentTime = this.currentTime;
            const lines = document.querySelectorAll('#lyricsDisplay .lyrics-line');
            
            lines.forEach((line, index) => {
                const time = parseFloat(line.dataset.time);
                const nextTime = index < lines.length - 1 ? 
                    parseFloat(lines[index + 1].dataset.time) : Infinity;
                
                if (currentTime >= time && currentTime < nextTime) {
                    line.classList.add('active');
                    line.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    line.classList.remove('active');
                }
            });
        });
    }

    // 设置面板功能
    document.getElementById('fontSize').addEventListener('input', function(e) {
        // 更新所有歌词行的字体大小
        const lines = document.querySelectorAll('#lyricsDisplay .lyrics-line, #calibrationLyricsDisplay .lyrics-line');
        lines.forEach(line => {
            line.style.fontSize = e.target.value + 'px';
        });
    });

    document.getElementById('fontColor').addEventListener('input', function(e) {
        // 更新所有背景歌词的颜色
        const lines = document.querySelectorAll('#lyricsDisplay .lyrics-line, #calibrationLyricsDisplay .lyrics-line');
        lines.forEach(line => line.style.color = e.target.value);
    });

    // 监听歌词位置设置
    lyricsPosition.addEventListener('change', function(e) {
        // 更新所有歌词的对齐方式
        const lines = document.querySelectorAll('#lyricsDisplay .lyrics-line, #calibrationLyricsDisplay .lyrics-line');
        lines.forEach(line => {
            line.style.textAlign = e.target.value;
        });
    });

    // 监听荧光效果设置
    glowEffect.addEventListener('change', function(e) {
        // 更新所有歌词容器的荧光效果
        document.querySelectorAll('.lyrics-container').forEach(container => {
            if (e.target.checked) {
                container.classList.add('glow-enabled');
            } else {
                container.classList.remove('glow-enabled');
            }
        });
    });

    // 格式化时间显示（毫秒版本）
    function formatTimeWithMs(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
    }

    // 更新KTV视频时间显示
    ktvVideo.addEventListener('timeupdate', function() {
        const timeDisplay = document.getElementById('ktvVideoTime');
        timeDisplay.textContent = formatTimeWithMs(this.currentTime);
    });

    // 更新视频时间显示
    videoPreview.addEventListener('timeupdate', function() {
        const timeDisplay = document.getElementById('videoPreviewTime');
        timeDisplay.textContent = formatTimeWithMs(this.currentTime);
    });

    // 进入时间轴调整模式
    timeAdjustBtn.addEventListener('click', function() {
        // 暂停当前播放的媒体
        if (ktvVideo) {
            ktvVideo.pause();
        }
        if (videoPreview) {
            videoPreview.pause();
        }
        if (audioPreviewPlayer) {
            audioPreviewPlayer.pause();
        }

        ktvSection.style.display = 'none';
        calibrationSection.style.display = 'block';
        calibrationVideo.src = ktvVideo.src;
        adjustedLyrics = JSON.parse(JSON.stringify(originalLyrics)); // 深拷贝原始歌词
        displayCalibrationLyrics();
    });

    // 显示校准模式的歌词
    function displayCalibrationLyrics() {
        const calibrationLyricsDisplay = document.getElementById('calibrationLyricsDisplay');
        calibrationLyricsDisplay.innerHTML = '';
        const fontSize = document.getElementById('fontSize').value;
        const fontColor = document.getElementById('fontColor').value;
        const textAlign = lyricsPosition.value;

        adjustedLyrics.forEach((lyric, index) => {
            const div = document.createElement('div');
            div.className = 'lyrics-line';
            div.textContent = lyric.text;
            div.dataset.time = lyric.time;
            div.style.fontSize = fontSize + 'px';
            div.style.color = fontColor;
            div.style.textAlign = textAlign;
            calibrationLyricsDisplay.appendChild(div);
        });

        // 如果启用了荧光效果，添加相应的类
        if (glowEffect.checked) {
            calibrationLyricsDisplay.parentElement.classList.add('glow-enabled');
        }
    }

    // 监听校准视频的播放进度，更新歌词高亮
    calibrationVideo.addEventListener('timeupdate', function() {
        const currentTime = this.currentTime;
        const lines = document.querySelectorAll('#calibrationLyricsDisplay .lyrics-line');
        
        lines.forEach((line, index) => {
            const time = parseFloat(line.dataset.time);
            const nextTime = index < lines.length - 1 ? 
                parseFloat(lines[index + 1].dataset.time) : Infinity;
            
            if (currentTime >= time && currentTime < nextTime) {
                line.classList.add('active');
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                line.classList.remove('active');
            }
        });
    });

    // 应用时间调整
    applyTimeAdjustBtn.addEventListener('click', function() {
        const adjustTime = parseFloat(timeAdjustValue.value);
        
        // 调整所有歌词的时间
        adjustedLyrics = adjustedLyrics.map(lyric => {
            return {
                ...lyric,
                time: lyric.time + adjustTime
            };
        });
        
        // 更新原始歌词为调整后的歌词
        originalLyrics = adjustedLyrics;
        
        // 返回播放模式
        calibrationSection.style.display = 'none';
        ktvSection.style.display = 'block';
        
        // 更新显示的歌词
        displayLyrics(originalLyrics);
    });

    // 恢复默认字体大小
    resetFontSize.addEventListener('click', function() {
        fontSizeInput.value = DEFAULT_FONT_SIZE;
        // 触发input事件以更新所有歌词
        fontSizeInput.dispatchEvent(new Event('input'));
    });

    // 返回按钮事件处理
    backBtn.addEventListener('click', function() {
        // 暂停校准视频播放
        if (calibrationVideo) {
            calibrationVideo.pause();
        }
        // 重置校准视频源
        calibrationVideo.src = '';
        
        calibrationSection.style.display = 'none';
        ktvSection.style.display = 'block';
    });
}); 