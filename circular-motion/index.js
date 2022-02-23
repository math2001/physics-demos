let canvasSize;
let canvas;
let tforcespan;
let c; // context 2d
let prev; // previous frame ran at
let tforce;
let pause = true;
let tom;

let theta = 0; // 0 is up
let omega = 1;
const radius = 40;

const pink = '#D81B60'
const blue = '#1E88E5'
const yellow = '#FFC107'

function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    canvasSize = size = rect.width;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
}

function r() {
    return canvasSize / 2 - radius - 20
}

function displayTforce() {
    return Math.round(tforce * 20 * 100) / 100
}

function main() {
    canvas = document.querySelector("canvas")
    c = canvas.getContext('2d')
    tforcespan = document.getElementById("t-force-span")
    tforceinput = document.getElementById("t-force-input")
    tom = document.getElementById('tom')


    document.getElementById("t-force-badge").style.backgroundColor = yellow
    document.getElementById("c-force-badge").style.backgroundColor = blue
    document.getElementById("n-force-badge").style.backgroundColor = pink

    tforce = parseInt(tforceinput.value) / 100
    tforcespan.textContent = displayTforce()
    tforceinput.addEventListener('input', () => {
        tforce = parseInt(tforceinput.value) / 100
        tforcespan.textContent = displayTforce()
    })

    const pauseBtn = document.getElementById("pause")
    pauseBtn.textContent = pause ? "Spin" : "Pause"
    pauseBtn.addEventListener('click', (e) => {
        pause = !pause;
        e.target.textContent = pause ? "Spin" : "Pause"
    })

    setCanvasSize()

    prev = Date.now()

    requestAnimationFrame(frame)
}

function drawVector(startX, startY, endX, endY, color) {
    const len2 = (startX - endX) * (startX - endX) + (startY - endY) * (startY - endY);
    if (len2 < 0.001) {
        return
    }

    c.strokeStyle = color
    c.lineWidth = 4
    c.fillStyle = color

    c.beginPath()
    c.moveTo(startX, startY)
    c.lineTo(endX, endY)
    c.stroke()

    const angle = Math.PI/2 - Math.atan2(endY - startY, endX - startX)

    const len = 15
    endX += 5 * Math.sin(angle)
    endY += 5 * Math.cos(angle)

    c.beginPath()
    c.moveTo(endX, endY)
    c.lineTo(endX + len * Math.cos(angle + 0.75 * Math.PI), 
             endY - len * Math.sin(angle + 0.75 * Math.PI))
    c.lineTo(endX - len * Math.cos(angle - 0.75 * Math.PI), 
             endY + len * Math.sin(angle - 0.75 * Math.PI))
    c.lineTo(endX, endY)
    c.fill()
}

function frame() {
    dt = (Date.now() - prev) / 1000 // in seconds
    prev = Date.now()
    c.fillStyle = "white"
    c.fillRect(0, 0, canvasSize, canvasSize)

    drawCenter()

    // technically not correct, but good enough to build intuition
    if (!pause) {
        omega += tforce * dt / 2
        theta += omega * dt
    }
    const x = canvasSize / 2 + Math.sin(theta) * r()
    const y = canvasSize / 2 - Math.cos(theta) * r()

    c.fillStyle = "blue"
    // c.beginPath()
    // c.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI)
    // c.fill()
    c.drawImage(tom, x - radius, y - radius, radius * 2, radius * 2)

    const scale = 50

    let endX, endY;

    // tangential force
    const tangle = theta + Math.PI / 2
    const tlength = tforce * scale * 5
    endX = x + Math.sin(tangle) * tlength
    endY = y - Math.cos(tangle) * tlength
    drawVector(x, y, endX, endY, yellow)

    // centripital force
    const cangle = theta + Math.PI
    const clength = omega * omega * scale // centripital force is proportional to omega^2
    endX = x + Math.sin(cangle) * clength
    endY = y - Math.cos(cangle) * clength
    drawVector(x, y, endX, endY, blue)

    // net force
    endX = x + Math.sin(tangle) * tlength + Math.sin(cangle) * clength
    endY = y - Math.cos(tangle) * tlength - Math.cos(cangle) * clength
    let xshift = 0, yshift = 0
    if (Math.abs(tforce) <= 0.1) {
        const shift = 5 * tforce / Math.abs(tforce)
        xshift = shift * Math.cos(theta)
        yshift = shift * Math.sin(theta)
    }
    drawVector(x + xshift, y + yshift, endX + xshift, endY + yshift, pink)

    requestAnimationFrame(frame)
}

function drawCenter() {
    const rad = 3
    c.beginPath()
    c.ellipse(canvasSize / 2, canvasSize / 2, rad, rad, 0, 0, Math.PI * 2)
    c.fillStyle = "#02111F"
    c.fill()
    c.textAlign = "center"
    c.fillText("Center", canvasSize / 2, canvasSize / 2 + 20)
}

window.addEventListener('resize', () => {
    setCanvasSize()
})

document.addEventListener("DOMContentLoaded", main)