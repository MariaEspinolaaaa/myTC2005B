//María Espínola Forcén | A01787172

//1 firstNonRepeating
function firstNonRepeating(string) {
    const letters = [];
    for (let i=0; i<string.length; i++) {
        let x = false;
        for (let ch of letters) {
            if (ch.char === string[i]) {
                ch.count++;
                x = true;
                break;
            }
        }
        if (!x) {
            letters.push({char: string[i], count: 1});
        }
    }
    for (let index in letters) {
        if (letters[index].count === 1) {
            return letters[index].char;
        }
    }
}

//2 bubbleSort
function bubbleSort(array) {
    for (let i=0; i<array.length-1; i++) {
        let f = false;
        for (let j=0; j<array.length-1-i; j++) {
            if (array[j]>array[j+1]) {
                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;
                f = true;
            }
        }
        if (f === false) {
            break;
        }
    }
    return array;
}

//3 invertArray
function invertArray(list) {
    let result = [];

    for (let i = list.length - 1; i > -1; i--) {
        result[result.length] = list[i];
    }

    return result;
}
//3.2 invertArrayInplace
function invertArrayInplace(arr) {
    let left = 0;
    let right = arr.length - 1;

    for (let i = 0; i < arr.length / 2; i++) {
        let temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;

        left++;
        right--;
    }

    return arr;
}

//4 capitalize
function capitalizeText(text) {
    let result = "";

    for (let i = 0; i < text.length; i++) {
        if (i === 0 || text[i - 1] === " ") {
            result += text[i].toUpperCase();
        } else {
            result += text[i];
        }
    }

    return result;
}

//5 mcd
function mcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

//6 hackerSpeak
function hackerSpeak(text) {
    let result = "";

    for (let i = 0; i < text.length; i++) {
        let char = text[i];

        if (char === "a") {
            result += "4";
        } else if (char === "e") {
            result += "3";
        } else if (char === "i") {
            result += "1";
        } else if (char === "o") {
            result += "0";
        } else if (char === "s") {
            result += "5";
        } else {
            result += char;
        }
    }

    return result;
}

//7 factorize
function factorize(num) {
    let result = [];

    for (let i = 1; i <= num; i++) {
        if (num % i === 0) {
            result[result.length] = i;
        }
    }

    return result;
}

//8 deduplicate
function deduplicate(list) {
    const result = [];

    for (let i = 0; i < list.length; i++) {
        let exists = false;

        for (let j = 0; j < result.length; j++) {
            if (result[j] === list[i]) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            result[result.length] = list[i];
        }
    }

    return result;
}

//9 findShortestString
function findShortestString(list) {
    if (list.length === 0) {
        return 0;
    }

    let smallest = list[0].length;

    for (let i = 1; i < list.length; i++) {
        if (list[i].length < smallest) {
            smallest = list[i].length;
        }
    }

    return smallest;
}

//10 isPalindrome
function isPalindrome(text) {
    let reversed = "";

    for (let i = text.length - 1; i > -1; i--) {
        reversed += text[i];
    }

    return text === reversed;
}

//11 sortStrings
function sortStrings(list) {
    for (let i = 0; i < list.length - 1; i++) {
        let swapped = false;

        for (let j = 0; j < list.length - 1 - i; j++) {
            if (list[j] > list[j + 1]) {
                let temp = list[j];
                list[j] = list[j + 1];
                list[j + 1] = temp;
                swapped = true;
            }
        }

        if (!swapped) {
            break;
        }
    }

    return list;
}

//12 stats
function stats(list) {
    let total = 0;
    let avg;
    const freq = [];

    for (let i = 0; i < list.length; i++) {
        total += list[i];

        let exists = false;
        for (let j = 0; j < freq.length; j++) {
            if (freq[j].value === list[i]) {
                freq[j].times++;
                exists = true;
                break;
            }
        }

        if (!exists) {
            freq[freq.length] = { value: list[i], times: 1 };
        }
    }

    let highest = 0;
    let mostFrequent;

    for (let i = 0; i < freq.length; i++) {
        if (freq[i].times > highest) {
            highest = freq[i].times;
            mostFrequent = freq[i].value;
        }
    }

    if (list.length === 0) {
        return [0, 0];
    } else {
        avg = total / list.length;
        return [avg, mostFrequent];
    }
}


//13 popularString
function popularString(list) {
    const freq = [];

    for (let i = 0; i < list.length; i++) {
        let exists = false;

        for (let j = 0; j < freq.length; j++) {
            if (freq[j].word === list[i]) {
                freq[j].times++;
                exists = true;
                break;
            }
        }

        if (!exists) {
            freq[freq.length] = { word: list[i], times: 1 };
        }
    }

    let highest = 0;
    let result = "";

    for (let i = 0; i < freq.length; i++) {
        if (freq[i].times > highest) {
            highest = freq[i].times;
            result = freq[i].word;
        }
    }

    return result;
}

//14 sPowerOf2
function isPowerOf2(number) {
    let operation = Math.sqrt(number);
    return Number.isInteger(operation);
}

//15 sortDescending
function sortDescending(array) {
    for (let i=0; i<array.length-1; i++) {
        let flag = false;
        for (let j=0; j<array.length-1-i; j++) {
            if (array[j]<array[j+1]) {
                let temp = array[j];
                array[j] = array[j+1];
                array[j+1] = temp;
                flag = true;
            }
        }
        if (flag === false) {
            break;
        }
    }
    return array;
}

export {
    firstNonRepeating,
    bubbleSort,
    invertArray,
    invertArrayInplace,
    isPalindrome,
    sortDescending,
    isPowerOf2,
    popularString,
    stats,
    sortStrings,
    findShortestString,
    capitalize,
    mcd,
    deduplicate,
    factorize,
    hackerSpeak,
};