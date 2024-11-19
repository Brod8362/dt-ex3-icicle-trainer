"use strict";
const icicles= [
    document.getElementById("e1"),
    document.getElementById("e2"),
    document.getElementById("e3"),
    document.getElementById("e4"),
    document.getElementById("e5"),
    document.getElementById("e6"),
    document.getElementById("e7"),
    document.getElementById("e8")
];
const destinations = [
    document.getElementById("d1"),
    document.getElementById("d2"),
    document.getElementById("d3"),
    document.getElementById("d4"),
    document.getElementById("d5"),
    document.getElementById("d6"),
    document.getElementById("d7"),
    document.getElementById("d8")
];
const bridges = [
    document.getElementById("b1"),
    document.getElementById("b2"),
    document.getElementById("b3"),
    document.getElementById("b4"),
]
const wait = document.getElementById("w");

let cheat_mode = false;

let winCount = 0;
let loseCount = 0;

const reset_button = document.getElementById("reset");
reset_button.onclick = reset;
const start_button = document.getElementById("start");
start_button.onclick = start;

/*
I1: B2 D1 -- W  B2  OK
I2: B4 D2 -- W  B4  OK
I3: B3 D3 -- W  B3  OK
I4: B1 D4 -- W  B1  OK
I5: W  B2 D5 B2 --  OK
I6: W  B4 D6 B4 --  OK
I7: W  B1 D7 B1 --  OK
I8: W  B3 D8 B3 --  
*/


// Step 1: bottom tether players cross bridge, side tether players wait for first players.
const step_1_correct_button = [
    bridges[1],
    bridges[3],
    bridges[2],
    bridges[0],
    wait,
    wait,
    wait,
    wait
];

// Step 2: bottom tether players proceed to destination, side tether players cross bridge
const step_2_correct_button = [
    destinations[0],
    destinations[1],
    destinations[2],
    destinations[3],
    bridges[1],
    bridges[3],
    bridges[0],
    bridges[2]
]

// Step 3: bottom tether players are chilling (skip this step), side tether players move to destination
const step_3_correct_button = [
    null,
    null,
    null,
    null,
    destinations[4],
    destinations[5],
    destinations[6],
    destinations[7]
]

// Step 3.5: AOEs go off. (implicit)

// Step 4: side tether players take their bridge back, bottom tether players wait.
const step_4_correct_button = [
    wait,
    wait,
    wait,
    wait,
    bridges[1],
    bridges[3],
    bridges[0],
    bridges[2]
];

// Step 5: bottom tether players take bridge back, side tether players are done.
const step_5_correct_button = [
    bridges[1],
    bridges[3],
    bridges[2],
    bridges[0],
    null,
    null,
    null,
    null
];

// all done!

function reset() {
    document.getElementById("start").disabled = false;
    clearHighlights();
    setIcicleStart();
    setDescription("Click 'start' to play with a random icicle, or click on a specific icicle to practice that scenario.");
}

function hideAll(collection) {
    for (let o of collection) {
        o.hidden = true;
    }
}

function showAll() {
    for (let o of collection) {
        o.hidden = false;
    }
}

function allClickTargets() {
    let a = [];
    for (let e of icicles) {
        a.push(e);
    }
    for (let b of bridges) {
        a.push(b);
    }
    for (let d of destinations) {
        a.push(d);
    }
    a.push(wait);
    return a;
}

function start(btn, index = Math.floor(Math.random() * 8)) {
    document.getElementById("start").disabled = true;
    document.getElementById("reset").disabled = false;
    highlightButton(icicles[index]);
    setBugcheck(index, 1);
    let correct_button = step_1_correct_button[index];
    if (cheat_mode) {
        highlightButton(correct_button);
    }
    
    setDescription("The icicles appear, and you have been tethered. The flashing icicle is the one you are tethered to. Decide what to do.");

    for (let b of bridges) {
        if (b == correct_button) { // if this bridge is what they should be doing
            b.onclick = () => {
                step2(index)
            };
        } else {
            if (wait == correct_button) { // player should have waited
                b.onclick = () => { fail(
                    "You should have waited. Remember that side tethers move second.", 
                    correct_button
                )};
            } else { //player selected wrong bridge
                b.onclick = () => {fail(
                    "You picked the wrong bridge. You should have selected the highlighted bridge. Outside tether takes north bridge, inside tether takes south bridge.",
                    correct_button
                )};
            }
        }
    }

    for (let d of destinations) {
        d.onclick = () => {
            fail(
                "You can't move directly to your destination without considering the bridges first.", 
                correct_button
            );
        }
    }

    if (correct_button == wait) {
        wait.onclick = () => {
            step2(index)
        };
    } else {
        wait.onclick = () => { fail(
            "You should have gone across the highlighted bridge. Remember that bottom tethers move first.", 
            correct_button
        )};
    }
}

function step2(index) {
    let correct_button = step_2_correct_button[index];
    clearHighlights();
    highlightButton(icicles[index]);
    setBugcheck(index, 2);
    console.log("step 2");

    if (index < 4) {
        setDescription("You move to the correct side on the correct bridge. Where do you need to stand?");
    } else {
        setDescription("You wait for the bottom tethered players to move first. Which bridge do you take?");
    }
    
    if (cheat_mode) {
        highlightButton(correct_button);
    }
    wait.onclick = () => {
        fail("By waiting, you probably just sent someone (and yourself) flying off the map. Observe the highlighted button for the correct answer.", correct_button);
    };
    //bottom tethers move to destinations
    for (let d of destinations) {
        if (correct_button == d) { // OK
            d.onclick = () => {
                step3(index);
            }
        } else { //clicked wrong destination
            if (index < 4) { //bottom player
                d.onclick = () => {
                    fail("You clicked the wrong destination, so your tethers are criss-crossed and someone is getting sent off the map. The highlighted square is where you should have gone.", correct_button);
                }
            } else { //side player
                d.onclick = () => {
                    fail("You need to cross correct bridge before you can proceed to your destination. The highlighted bridge was the correct bridge.", correct_button);
                }
            }

        }
    }

    //side tethers move to bridges
    for (let b of bridges) {
        if (b == correct_button) {
            b.onclick = () => {
                step3(index);
            }
        } else {
            if (index < 4) { //bottom player
                b.onclick = () => {
                    fail("You need to wait for the side tethered players to move and the icicles to go off before moving back.", correct_button);
                }
            } else {
                b.onclick = () => {
                    fail("You picked the wrong bridge and probably just killed someone. The highlighted bridge is where you should have gone.", correct_button);
                }
            }
        }
    }
}

function step3(index) {
    let correct_button = step_3_correct_button[index];
    if (correct_button == null) {
        step4(index);
        return;
    }
    if (cheat_mode) {
        highlightButton(correct_button);
    }
    setDescription("You cross the bridge safely. Where do you go next?");
    clearHighlights();
    highlightButton(icicles[index]);
    console.log("step 3");
    setBugcheck(index, 3);

    for (let d of destinations) {
        if (d == correct_button) {
            d.onclick = () => {
                step4(index);
            }
        } else {
            d.onclick = () => {
                fail("You clicked the wrong destination, so your tethers are criss-crossed and someone is getting sent off the map. The highlighted square is where you should have gone.", correct_button);
            }
        }
    }

    for (let b of bridges) {
        b.onclick = () => {
            fail("You already crossed the bridge and now need to move to your destination. The highlighted square is your correct destination.", correct_button);
        }
    }

    wait.onclick = () => {
        fail("cant wait", correct_button);
    }

}

function step4(index) {
    let correct_button = step_4_correct_button[index];
    clearHighlights();
    highlightButton(icicles[index]);
    console.log("step 4");
    setBugcheck(index, 4);

    if (cheat_mode) {
        highlightButton(correct_button);
    }

    setDescription("BOOM! The icicles go off, and nobody is tethered anymore. What do you do next?");

    if (correct_button == wait) { //bottom tethers
        wait.onclick = () => {
            step5(index);
        }
    } else { //side tethers
        //cant wait here
        wait.onclick = () => {
            fail("You can't wait here, you need to start the process of getting back so you don't die to Legitimate Force.", correct_button);
        }
    }

    for (let d of destinations) {
        d.onclick = () => {
            fail("Side-tethered players (e.g you) need to move back to the center first, so you don't delay the other players from getting back in time.", correct_button);
        }
    }

    for (let b of bridges) {
        if (b == correct_button) {
            b.onclick = () => {
                step5(index);
            }
        } else {
            if (index < 4) { //bottom tethers
                b.onclick = () => {
                    fail("You went too early and probably killed someone. You need to wait for the side tethered players to cross the bridge first.", correct_button);
                }
            } else { //side tethers
                b.onclick = () => {
                    fail("You picked the wrong bridge and probably just killed someone. Review the highlighted button for the bridge you should have taken.", correct_button);
                }
            }
        }
    }
}

function step5(index) {
    let correct_button = step_5_correct_button[index];
    if (correct_button == null) {
        win();
        return;
    }

    setDescription("The side-tethered players have moved back to the center. What do you do next?");
    clearHighlights();
    highlightButton(icicles[index]);
    console.log("step 5");
    setBugcheck(index, 5);
    if (cheat_mode) {
        highlightButton(correct_button);
    }

    for (let d of destinations) {
        d.onclick = () => {
            fail("you need to go back to not die to Legitimate Force", correct_button);
        }
    }

    for (let b of bridges) {
        if (b == correct_button) {
            b.onclick = () => {
                win();
            }
        } else {
            b.onclick = () => {
                fail("You took the wrong bridge and probably just killed someone. See the highlighted bridge.", correct_button);
            }
        }
    }

    wait.onclick = () => {
        fail("You need to get back to the center of the map to not die to Legitimate Force.", correct_button);
    }

}

function win() {
    winCount += 1;
    setDescription("You win!", "PASS")
    updateWinLose();
}

function highlightButton(btn) {
    btn.classList.add("highlight");
}

function clearHighlights() {
    let allButtons = document.getElementsByTagName("button");
    for (let b of allButtons) {
        b.classList.remove("highlight");
    }
}

function setBugcheck(index, step) {
    let allButtons = document.getElementsByTagName("button");
    for (let b of allButtons) {
        if (b == start_button) {
            continue;
        }
        if (b == reset_button) {
            continue;
        }
        if (b.classList.contains("icicle")) {
            continue; //iciles should never be clickable
        }
        b.onclick = () => {
            alert(`You found a bug! debug info: I${index} S${step} ${b.id}`)
        }
    }
}

function setDescription(str, indicator=null) {
    document.getElementById("description").innerText = str;
    if (indicator != null) {
        document.getElementById("pfindicator").innerText = indicator;
    } else {
        document.getElementById("pfindicator").innerText = null;
    }
}

function fail(reason, correct_elem) {
    console.log("failure!")
    highlightButton(correct_elem); 
    allClickTargets().forEach(k => k.onclick = () => {alert("Click reset to try again.")});
    setDescription(reason, "FAIL")
    loseCount += 1;
    updateWinLose();
}

function updateWinLose() {
    document.getElementById("wincount").innerHTML = winCount;
    document.getElementById("losecount").innerHTML = loseCount;
}

function setIcicleStart() {
    for (let i = 0; i < 8; i++) {
        icicles[i].onclick = () => {
            start(null, i);
        }
    }
}

window.onload = function() {
    reset();
};