/*------------------------------------------------*/
//          Created by: Sven Arends               //
//     For his website: http://trippple.co.nf     //
/*------------------------------------------------*/

$("#canvas").prop('width',800); // Set game window width
$("#canvas").prop('height',600); // Set game window height
var ctx = canvas.getContext("2d"); // Set canvas renderable
var ballRadius = 10; // Ball radius
var x = canvas.width/2; // ball X
var y = canvas.height/2; // ball Y
var dx = 2; // Direction X
var dy = 2; // Direction Y
var speed = 2; // Speed (Unused for now)
var mouseX = 0; // Mouse X
var mouseY = 0; // Mouse Y
var randomInt = 0; // Random Integer
var particles = []; // Particle list
var powerups = []; // Powerups list
var particeCount = 20; // particle count to render at once
var score = 0; // game score
var gameover = false; // gameover?
var paddleHitColor = "#000"; // particle color on paddle hit
var playerDieColor = "#000"; // particle color on die
var paddleW = 150; // Paddle Width
var paddleH = 15; // Paddle Height
var powerupT = 0; // Powerup Timer
var ballSpeed = 5; // Ball speed
var ghostBall = false; // ghostBall?

var bricks; // Brick list
var NROWS = 5; // Brick amount on X axis
var NCOLS = 5; // Brick amount on Y axis
var BRICKWIDTH = (canvas.width/NCOLS) - 2; // The width of a brick
var BRICKHEIGHT = 15; // The height of a brick
var PADDING = 2;  // The padding between bricks
var bricksLeft = 1; // ammount of bricks left

initbricks(); // Run once on start
function initbricks() {  // Create the bricks but not render them yet

	bricks = new Array(NROWS); // Array of bricks: [NROWS: [NCOLS: 1, NCOLS: 1], NROWS: [NCOLS: 1, NCOLS: 1]] ETC...
	for (i=0; i < NROWS; i++) { // Loop NROWS
		bricks[i] = new Array(NCOLS); // Set NCOLS in bricks Array
		for (j=0; j < NCOLS; j++) {  // Loop NCOLS
			bricks[i][j] = 1; // set bricks[NROWS][NCOLS] to 1 (value 0/1 is dead or alive)
		}
	}
	bricksLeft = NROWS*NCOLS; // Variable how many bricks are left
}
function rect(x,y,w,h) { // Create rectangles
	ctx.beginPath(); // Begin the draw path
	ctx.rect(x,y,w,h); // Draw rect at x,y size w,h
	ctx.fillStyle = "#000"; // Color: black
	ctx.fill(); // Fill it with the color
	ctx.closePath(); // End the draw path
}
function drawBall(posX, posY) { // Draw the ball
	ctx.beginPath(); // Begin the draw path
	ctx.arc(posX, posY, ballRadius, 0, Math.PI*2); // Draw circle at x,y / Start angle: (0 is 3o'clock) / End angle: (Math.PI*2 is full circle)
	ctx.fillStyle = "#000"; // Color: black
	ctx.fill(); // Fill it with the color
	ctx.closePath(); // End the draw path
}
function draw() { // Main loop
	if (dx > ballSpeed) // If Speed on X axis > max speed on X axis
		dx = ballSpeed; // Speed on X axis = max Speed on X axis
	if (dy > ballSpeed) // If Speed on Y axis > max speed on Y axis
		dy = ballSpeed; // Speed on Y axis = max Speed on Y axis
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the whole screen
	drawBall(x, y); // Draw the ball
	rect(mouseX-(paddleW/2), canvas.height-(paddleH/2), paddleW, paddleH); // Draw the paddle

	// Draw bricks
	for (i=0; i < NROWS; i++) { // Loop NROWS
	    for (j=0; j < NCOLS; j++) { // Loop NCOLS
			if (bricks[i][j] == 1) { // If brick is alive
				rect((j * (BRICKWIDTH + PADDING)) + PADDING,(i * (BRICKHEIGHT + PADDING)) + PADDING,BRICKWIDTH, BRICKHEIGHT); // Draw brick
			}
        }
	}
	if (bricksLeft == 0) { // If there are no bricks left
		NCOLS+=5; // Add 5 bricks Horizontaly
		x = canvas.width/2; // Set ball on X center
		y = canvas.height/2; // Set ball on Y center
		initbricks(); // Setup the bricks
	}
	if (powerupT == 0){ // Timer for howlong a powerup lasts
		paddleW = 150; // Set paddle Width to default
		ghostBall = false; // No more ghost ball
	}else{ // powerupT > 0
		powerupT -=1; // powerupT - 1
	}

	moveBall(); // Move the ball
	checkCollision(); // Check for collisions
	emitParticles(); // Render particles
	showPowerups(); // Render powerups
}
function getMousePos(canvas, evt) { // Get the mouse position
	var rect = canvas.getBoundingClientRect(); // Get canvas size
	mouseX = evt.clientX - rect.left; // Get mouse X
	mouseY = evt.clientY - rect.top; // Get mouse Y
	return { // Return X and Y
		x: evt.clientX - rect.left, // X pos
		y: evt.clientY - rect.top // Y pos
	};
}
canvas.addEventListener('mousemove', function(evt) { // On mouse movement
	var mousePos = getMousePos(canvas, evt); // Get the mouse position
});

function moveBall() { // Move the ball
	x += dx; // add dx to x
	y += dy; // add dy to y
}
function checkCollision() { // Check for collisions
	if (x + dx + ballRadius > canvas.width || x + dx - ballRadius < 0) // If the ball hit a wall on the X axis: bounce
		dx = -dx; // Invert direction

	if (y + dy - ballRadius < 0) // If the ball hets a wall on top: bounce
		dy = -dy; // Invert direction
	else if (y + dy + ballRadius > canvas.height - paddleH/2) { // If ball Y is > Paddle Y
		if (x > mouseX-(paddleW/2) && x < mouseX+(paddleW/2)) { // If ball X is > Paddle X
			dx = 6 * ((x-(mouseX+75/2))/75); // Move ball in random direction
			dy = -dy; // Invert Y
			for(var k = 0; k < particeCount; k++) { // Loop particles
				particles.push(new createParticles(x, y, 0.75, 1, paddleHitColor, paddleHitColor)); // add a particle
			}
		}
		else if (y + dy + ballRadius > canvas.height+5) // If ball Y > canvas height
			if (gameover == false) { // If gameover is false
				restart(); // Restart game
				gameover = true; // gameover is true
			}
	}

	rowheight = BRICKHEIGHT + PADDING; // The total height of 1 row
	colwidth = BRICKWIDTH + PADDING; // The total width of 1 Collum
	row = Math.floor(y/rowheight); // If ball Y = row height
	col = Math.floor(x/colwidth); // If ball X = row width
	if (y < NROWS * rowheight && row >= 0 && col >= 0 && bricks[row][col] == 1) { // If collision with a brick
		if (ghostBall == false) // If powerup: ghostball is false
			dy = -dy; // Invert driection
		bricks[row][col] = 0; // Set collinding brick dead
		for(var k = 0; k < particeCount*2; k++) { // Loop particles
			particles.push(new createParticles(x, y, 1.25, 1, paddleHitColor, paddleHitColor)); // Create a particle
		}
		var rand = Math.random(); // Random for powerup
		if (rand > 0.6) // if random Float > 0.6
			if (rand > 0.73 && rand < 0.85){
				powerups.push(new createPowerup(x, y, "smallPaddle")); // Add powerup
			}else if (rand > 0.86){
				powerups.push(new createPowerup(x, y, "fastBall")); // Add powerup
			}else{
				powerups.push(new createPowerup(x, y, "ghostBall")); // Add powerup
			}
		bricksLeft--; // Remove 1 brick from the brick count
		score++; // Add score
	}
}
function restart() { // Restart game
	NCOLS = 5; // Default NCOLS
	x = canvas.width/2; // Ball to center of screen
	y = canvas.height/2; // Ball to center of screen
	dx = 2; // Ball default direction
	dy = 2; // Ball default direction
	gameover = false; // No game over anymore
	initbricks(); // Setup bricks
	score = 0; // Reset score
}
function createPowerup(x, y, type) { // Create a powerup usage: array.push(new createPowerup(posX, posY, "smallPaddle/fastBall/ghostBall"))
	this.x = x || 0; // set x
	this.y = y || 0; // set y
	this.t = type; // set type
}
function showPowerups(){ // Render powerups
	for(var j = 0; j < powerups.length; j++) {// For each powerups
		pwrp = powerups[j]; // set shortcut

		ctx.beginPath(); // Begin the draw path
		ctx.fillStyle = "#000"; // Set color: black
		ctx.textAlign = "center"; // Center text
		ctx.font = "bold 50px Arial"; // Set font to: Arial 50px Bold
		if (pwrp.t == "smallPaddle"){ // if type is smallPaddle
			ctx.fillText("-", pwrp.x, pwrp.y); // Draw - text
		}else if (pwrp.t == "fastBall"){ // if type is fastBall
			ctx.fillText("+", pwrp.x, pwrp.y); // Draw + text
		}else if (pwrp.t == "ghostBall"){ // if type is Ghostball
			ctx.fillText("~", pwrp.x, pwrp.y); // Draw ~ text
		}

		ctx.closePath(); // End the draw path

		pwrp.y += 1; // Move powerup down

		if (pwrp.y > canvas.height+20) // If powerup is out of view
			powerups.splice(j, 1); // Remove it

		if (pwrp.y + ballRadius > canvas.height - paddleH/2) { // If powerup collides with paddle
			if (pwrp.x > mouseX-(paddleW/2) && pwrp.x < mouseX+(paddleW/2)) { // If powerup collides with paddle
				for(var k = 0; k < particeCount*4; k++) { // Loop particles
					particles.push(new createParticles(pwrp.x, pwrp.y, 1.25, 1, paddleHitColor, paddleHitColor)); // Add a particle
				}
				powerups.splice(j, 1); // Remove it
				if (pwrp.t == "smallPaddle"){ // if type is smallPaddle
					paddleW = 75; // Set paddleW 75px
					powerupT = 1000; // Duration
				}else if (pwrp.t == "fastBall"){ // if type is fastBall
					ballSpeed += 2; // add 2 to MAXIMUM ballSpeed
				}else if (pwrp.t == "ghostBall"){ // if type is Ghostball
					ghostBall = true; // set ghostBall true
					powerupT = 200; // Duration
				}
			}
		}
	}
}
function createParticles(x, y, s, m, c, k) { // Create particle usage: array.push(new createPowerup(posX, posY, size, m, color, stroke))
	this.x = x || 0; // Set X
	this.y = y || 0; // Set Y
	
	this.radius = s; // Set Radius
	this.color = c; // Set Color
	this.stroke = k; // Set Stroke
	
	this.vx = -1.5 + Math.random()*3; // Set velocity X
	this.vy = m * Math.random()*1.5; // Set velocity Y
}
function emitParticles() { // Render the particles
	for(var j = 0; j < particles.length; j++) { // For each particle
		par = particles[j]; // Set shortcut
		
		ctx.beginPath(); // Begin draw path
		ctx.fillStyle = par.color; // Set color
		ctx.strokeStyle = par.stroke; // Set Stroke
		ctx.stroke(); // Apply Stroke
		if (par.radius > 0) { // Render circle if radius > 0
			ctx.arc(par.x, par.y, par.radius, 0, Math.PI*2, false); // Render Circle
		}
		ctx.fill();	// Fill the circle
		
		par.x += par.vx; // Set velocity X
		par.y += par.vy; // Set velocity Y
		
		par.radius = Math.max(par.radius - 0.01, 0.0); // Set new radius (Fade out)
		if (par.radius < 0.02) { // If radius is smaller then 0.02
			particles.splice(j, 1); // Remove it
		}
		
	} 
}

setInterval(function(){ // Game loop
	draw(); // Run main function
	$("#currScore").text("Score: " + score); // Set score
}, 5); // Delay 5 = default
