function ready() {

    const audio = $("#audio")[0];
    const canvas = $("#visualizer")[0]
    const canvasCtx = canvas.getContext("2d");

    let audioContext;
    let analyser;
    let bufferLength;
    let dataArray;

    function init() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio); // Use the <audio> element as the source

        source.connect(analyser);
        analyser.connect(audioContext.destination); // You can disconnect this if you only want visualization

        analyser.fftSize = 1024;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        resizeCanvas();
        visualize();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawFrequencyBars() {
        canvasCtx.fillStyle = 'rgb(255,255,255)';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        const sensitivity = 200

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i]*(canvas.height/200);
            const hue = i / bufferLength * 360;
            canvasCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    }

    function visualize() {
        requestAnimationFrame(visualize);
        analyser.getByteFrequencyData(dataArray);
        drawFrequencyBars(); // Or call drawWaveform() or your custom drawing function
    }

    // Initialize the audio context and analyser when the audio starts playing
    audio.addEventListener('play', () => {
        if (!audioContext) {
            init();
        }
    });

    window.addEventListener('resize', resizeCanvas);
}