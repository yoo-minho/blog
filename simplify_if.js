function getLogic1(alphabet, number, korean) {
    let logicName = "";
    if (alphabet === "A") {
        if (number === 0) {
            if (korean === "가") {
                logicName = "LOGIC_1";
            } else if (korean === "나") {
                logicName = "LOGIC_2";
            }
        } else if (number === 1) {
            logicName = "LOGIC_3";
        }
    } else if (alphabet === "B") {
        if (number === 2) {
            logicName = "LOGIC_4";
        } else if (number === 3) {
            if (korean === "가") {
                logicName = "LOGIC_5";
            } else if (korean === "다") {
                logicName = "LOGIC_6";
            }
        }
    } else {
        if (korean === "나") {
            logicName = "LOGIC_7";
        } else if (korean === "다") {
            logicName = "LOGIC_";
        }
    }
    return logicName;
}

function getLogic11(alphabet, number, korean) {
    if (alphabet === "A") {
        if (number === 0 && korean === "가") return "LOGIC_1";
        if (number === 0 && korean === "나") return "LOGIC_2";
        if (number === 0) return "";
        if (number === 1) return "LOGIN_3";
    }
    if (alphabet === "B") {
        if (number === 2) return "LOGIC_4";
        if (number === 3 && korean === "가") return "LOGIC_5";
        if (number === 3 && korean === "다") return "LOGIC_6";
        if (number === 3) return "";
    }
    if (korean === "나") return "LOGIC_7";
    if (korean === "다") return "LOGIN_8";
    return "";
}

function getLogic111(alphabet, number, korean) {
    let logicName = "";
    if (alphabet === "A") {
        logicName = {
            0: {
                "가": "LOGIC_1",
                "나": "LOGIC_2",
            }[korean],
            1: "LOGIC_3"
        }[alphabet]
    } else if (alphabet === "B") {
        if (number === 2) {
            logicName = "LOGIC_4";
        } else if (number === 3) {
            if (korean === "가") {
                logicName = "LOGIC_5";
            } else if (korean === "다") {
                logicName = "LOGIC_6";
            }
        }
    } else {
        if (korean === "나") {
            logicName = "LOGIC_7";
        } else if (korean === "다") {
            logicName = "LOGIC_";
        }
    }
    return logicName;
}

function getLogic2(alphabet, number, korean) {
    let logicName = "";
    if (alphabet === "A") {
        if (number === 0) {
            if (korean === "가") {
                logicName = "LOGIC_1";
            } else {
                logicName = "LOGIC_2";
            }
        } else {
            logicName = "LOGIC_3";
        }
    } else {
        logicName = "LOGIC_4";
    }
    return logicName;
}

function getLogic22(alphabet, number, korean) {
    if (alphabet !== "A") return "LOGIC_4";
    if (number !== 0) return "LOGIC_3";
    if (korean !== "가") return "LOGIN_2";
    return "LOGIN_1";
}

function getLogin3(alphabet) {
    let logicName = "";
    if (alphabet === "A") {
        logicName = "LOGIC_1";
    } else if (alphabet === "B") {
        logicName = "LOGIC_2";
    } else if (alphabet === "C") {
        logicName = "LOGIC_3";
    } else if (alphabet === "D") {
        logicName = "LOGIC_4";
    } else if (alphabet === "E") {
        logicName = "LOGIC_5";
    } else if (alphabet === "F") {
        logicName = "LOGIC_6";
    } else if (alphabet === "G") {
        logicName = "LOGIC_7";
    } else {
        logicName = "LOGIC_8";
    }
}

function getLogic33(alphabet) {
    let logicName = "";
    switch (alphabet) {
        case "A" :
            logicName = "LOGIC_1";
            break;
        case "B" :
            logicName = "LOGIC_2";
            break;
        case "C" :
            logicName = "LOGIC_3";
            break;
        case "D" :
            logicName = "LOGIC_4";
            break;
        case "E" :
            logicName = "LOGIC_5";
            break;
        case "F" :
            logicName = "LOGIC_6";
            break;
        default :
            logicName = "LOGIG_7"
    }
    return logicName;
}

function getLogic333(alphabet) {
    return {
        "A": "LOGIC_1",
        "B": "LOGIC_2",
        "C": "LOGIC_3",
        "D": "LOGIC_4",
        "E": "LOGIC_5",
        "F": "LOGIC_6",
    }[alphabet] || "LOGIC_7"
}

//함수도 이케 활용가능? 쌉가능