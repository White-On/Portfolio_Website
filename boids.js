const boidsCanvas = document.getElementById('boidsCanvas');
let initPosition = document.getElementById('Jules-img');
initPosition = initPosition.getBoundingClientRect();

let startPosition = { x :(initPosition.width / 2) + initPosition.x,
                   y : (initPosition.height / 2) + initPosition.y };

console.log(startPosition);

boidsCanvas.height = window.innerHeight;
boidsCanvas.width = window.innerWidth;

const boidsContext = boidsCanvas.getContext('2d');

const alignmentStrength = 1;
const cohesionStrength = 1;
const separationStrength = 1.4;


class Boids {
  constructor(N) {
    this.boids = [];
    for (let i = 0; i < N; i++) {
        this.boids.push(new Boid());
        }
  }

  run() {
    for (let boid of this.boids) {
      boid.run(this.boids);
    }
  }
}

class Vector {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
    }

    div(n) {
        this.x /= n;
        this.y /= n;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    setMag(n) {
        this.normalize();
        this.mult(n);
    }

    normalize() {
        let m = this.mag();
        if (m != 0) {
            this.div(m);
        }
    }

    limit(n) {
        if (this.mag() > n) {
            this.setMag(n);
        }
    }

    heading() {
        return Math.atan2(this.y, this.x);
    }

    rotate(a) {
        let newHeading = this.heading() + a;
        let mag = this.mag();
        this.x = Math.cos(newHeading) * mag;
        this.y = Math.sin(newHeading) * mag;
    }

    static random2D() {
        return new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
    }

    static add(v1, v2) {
        return new Vector(v1.x + v2.x, v1.y + v2.y);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static mult(v, n) {
        return new Vector(v.x * n, v.y * n);
    }

    static div(v, n) {
        return new Vector(v.x / n, v.y / n);
    }

    static dist(v1, v2) {
        let dx = v1.x - v2.x;
        let dy = v1.y - v2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

}

// function dist(x1, y1, x2, y2){
//     return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
// }


class Boid {
    constructor() {
        this.position = new Vector(Math.random() + startPosition.x , Math.random() + startPosition.y);
        this.velocity = Vector.random2D();
        this.velocity.setMag(Math.random(2, 4));
        this.acceleration = new Vector();
        this.maxForce = 0.2;
        this.maxSpeed = 3;
        this.perceptionRadius = 100;
        this.sprite = new Image();
        this.sprite.src = "images/boid.png";
    }

    edges() {
        if (this.position.x > boidsCanvas.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = boidsCanvas.width;
        }

        if (this.position.y > boidsCanvas.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = boidsCanvas.height;
        }
    }

    align(boids) {
        let perceptionRadius = this.perceptionRadius;
        let steering = new Vector();
        let total = 0;
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (other != this && d < perceptionRadius) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let perceptionRadius = this.perceptionRadius;
        let steering = new Vector();
        let total = 0;
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (other != this && d < perceptionRadius) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    separation(boids) {
        let perceptionRadius = this.perceptionRadius;
        let steering = new Vector();
        let total = 0;
        for (let other of boids) {
            let d = Vector.dist(this.position, other.position);
            if (other != this && d < perceptionRadius) {
                let diff = Vector.sub(this.position, other.position);
                diff.div(d * d);
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(this.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(this.maxForce);
        }
        return steering;
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let separation = this.separation(boids);

        alignment.mult(alignmentStrength);
        cohesion.mult(cohesionStrength);
        separation.mult(separationStrength);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    getTrianglePoints() {
        let points = [];
        let angle = this.velocity.heading() + Math.PI / 2;
        let x = this.position.x;
        let y = this.position.y;
        let r = 10;
        points.push(new Vector(x + Math.cos(angle) * r, y + Math.sin(angle) * r));
        points.push(new Vector(x + Math.cos(angle + 4 * Math.PI / 3) * r, y + Math.sin(angle + 4 * Math.PI / 3) * r));
        points.push(new Vector(x + Math.cos(angle + 2 * Math.PI / 3) * r, y + Math.sin(angle + 2 * Math.PI / 3) * r));
        return points;
    }


    show(context) {
        // let points = this.getTrianglePoints();
        // context.fillStyle = 'red';
        // context.beginPath();
        // context.moveTo(points[0].x, points[0].y);
        // context.lineTo(points[1].x, points[1].y);
        // context.lineTo(points[2].x, points[2].y);
        // context.fill();

        context.drawImage(this.sprite, this.position.x - 10, this.position.y - 10, 20, 20);
    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.edges();
        this.show(boidsContext);
    }


}

const boids = new Boids(100);

animate();


function animate(time){
    boidsCanvas.height = window.innerHeight;
    boidsCanvas.width = window.innerWidth;

    boids.run();

    requestAnimationFrame(animate);
}
