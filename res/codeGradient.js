math.import({eye: math.identity}, {override: true})
let exprPolynomHtml = document.getElementById('expr'),
    prettyFxHtml = document.getElementById('prettyFx'),
    prettyG1Html = document.getElementById('prettyG1'),
    // prettyG2Html = document.getElementById('prettyG2'),
    parenthesis = 'keep',
    xZero = [document.getElementById('zeroX1'), document.getElementById('zeroX2')],
    accuracy = document.getElementById('accuracy'),
    maxIters = document.getElementById('maxIters'),
    g1Expr = document.getElementById('g1Expr'),
    // g2Expr = document.getElementById('g2Expr'),
    outputHtml = document.getElementById('output');
    //g2Expr = document.getElementById('g2Expr'),
    //g2Value = document.getElementById('g2Value'); 

//Code initialization

prettyFxHtml.value = '(x-4)^2+(y-5)^2';
xZero[0].value = 0;
xZero[1].value = 0;
accuracy.value = 0;
maxIters.value = 5;
g1Expr.value = 'x+y-1';
//g2Expr.value = 'x1+x2-1';
//g2Value.value = 0;

//dataForAlg initialization
var data = new DataForGradientAlg(prettyFxHtml.value,g1Expr.value,xZero[0].value,xZero[1].value,accuracy.value,maxIters.value);


calculateAndViewAlg(data,prettyFxHtml, prettyG1Html,output);

function calculateAndViewAlg(data,prettyFxHtml, prettyG1Html,outputHtml) {
    //preparetions
    setVariables(data);

    //calculations
    var gradientAlgResult = gradientAlgorithm(data);

    //view
    //вывод Fx и G1
    viewFxAndG1Pretty(data, prettyFxHtml, prettyG1Html);
    viewGradientAlgResult(data,gradientAlgResult,outputHtml);
}

//---------------------------STEPS------------------------------

function setVariables(dataForGradientAlg){
    dataForGradientAlg.variablesFx = getVariablesFromPolynom(dataForGradientAlg.Fx);
    dataForGradientAlg.variablesg1 = getVariablesFromPolynom(dataForGradientAlg.g1Expr);
}

function stepOne(dataForGradientAlg,algResult){
    algResult.stepOne = `Задаём x0 = (${dataForGradientAlg.xZero[0]};
        ${dataForGradientAlg.xZero[1]}); `;
    algResult.stepOne += `e = ${dataForGradientAlg.accuracy};`;
    algResult.stepOne += `M = ${dataForGradientAlg.maxIterations};`;
    dataForGradientAlg.xk = dataForGradientAlg.xZero;
    
}
function stepTwo(dataForGradientAlg,algResult){
    dataForGradientAlg.numderOfIteration =0;
    algResult.stepTwo = `k = ${dataForGradientAlg.numderOfIteration}`;
}
function stepThree(dataForGradientAlg,algResult){
    let sign = getSignOfСomparison(dataForGradientAlg.numderOfIteration,
        dataForGradientAlg.maxIterations);
    algResult.stepsHtml[dataForGradientAlg.numderOfIteration] = 
    setPrettyTr("Шаг 3", `Проверим k ≥ M <br>${dataForGradientAlg.numderOfIteration} 
        ${sign} ${dataForGradientAlg.maxIterations}`,'');

    return sign;
    
}
function stepFour(dataForGradientAlg,algResult){

    let gradient = new Gradient(dataForGradientAlg.variablesg1[0],dataForGradientAlg.variablesg1[1],dataForGradientAlg.g1Expr);

    gradient.setGradientInPoint(getPointG1ArgsXkValue(dataForGradientAlg));

    dataForGradientAlg.gradientG1 = gradient;
    algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 4", `${gradient.getGradientInPoint()}`,'');
}
function stepFive(dataForGradientAlg,algResult){

    //------------------------------------------------Не понимаю пока что подставлять Xk или X0 (сделал XK) !----------------------------------------------------------------------
    let pointG1 = getPointG1ArgsXkValue(dataForGradientAlg);
    
    let inverted = '('+dataForGradientAlg.g1Expr+')*-1';

    let g1InPoint = math.format((math.eval((inverted).toString(), pointG1)), {
        notation: 'fixed',
        precision: 2
    });
    dataForGradientAlg.tk=g1InPoint;
    algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 5", `${g1InPoint.toString()}`,'');
}
function stepSix(dataForGradientAlg,algResult){
    let gradientInPoint =dataForGradientAlg.gradientG1.getGradientInPoint();
    //------------------------------------------------------------------------------тут я быренько забахал может вызвать проблемесы-----------------------------------
    sigma2Xk = math.multiply(math.multiply(math.transpose(gradientInPoint),math.inv(math.multiply(gradientInPoint,math.transpose(gradientInPoint)))),dataForGradientAlg.tk);
    dataForGradientAlg.sigma2Xk = sigma2Xk;
    algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 6", `${sigma2Xk.toString()}`,'');
}
function stepSeven(dataForGradientAlg,algResult){
    
    dataForGradientAlg.sigma2Xk = sigma2Xk;
    evcideNorm = evclideNorm(sigma2Xk);
    dataForGradientAlg.evcideNormSigma2Xk = evclideNorm;
    algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 7", `${evcideNorm.toString()}`,'');
}
function stepEight(dataForGradientAlg,algResult){
    
    let gradient = new Gradient(dataForGradientAlg.variablesFx[0],dataForGradientAlg.variablesFx[1],dataForGradientAlg.Fx);

    gradient.setGradientInPoint(getPointFxArgsXkValue(dataForGradientAlg));

    dataForGradientAlg.gradientFx = gradient;

    algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 8", `${gradient.getGradientInPoint()}`,'');
}
function stepNine(dataForGradientAlg,algResult){
    let g = dataForGradientAlg.gradientG1.getGradientInPoint();
    console.log(g);
    //----------------------------------------------------Сука она не работает на одномерные массивы а я ебался 100 лет над этой хуйнёй аааааааааааааааааааа
    console.log(math.transpose(g));
    //----------------Вроде правильна
    AT_multipl_By_A_Inversed = math.inv(math.multiply(g,math.transpose(g)));

    //----------------In progress
    let a = [
        [0.5],
        [0.5]
    ];
    a_transporent = [1,1];
    console.log(a);
    console.log(math.transpose(a));
    console.log(math.multiply(a,math.transpose(a)));
    console.log(math.transpose(g));
    console.log(math.multiply(AT_multipl_By_A_Inversed,math.transpose(g)));
    Multiplyed_by_g_and_transporend_g =math.multiply(math.multiply(AT_multipl_By_A_Inversed,math.transpose(g)),g);

    console.log(Multiplyed_by_g_and_transporend_g);
    deltaXk = math.multiply(math.multiply(math.add(math.identity(g.length),math.multiply(Multiplyed_by_g_and_transporend_g,-1)),-1),math.transpose(dataForGradientAlg.gradientFx.getGradientInPoint()));
  
    algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 9", `${deltaXk.toString()}`,'');
}
function stepTen(dataForGradientAlg,algResult){
    
    

    //algResult.stepsHtml[dataForGradientAlg.numderOfIteration]+= setPrettyTr("Шаг 10", `${gradient.getGradientInPoint()}`,'');
}

//------------------------------ROOTS-----------------------------------------
function gradientAlgorithm(dataForGradientAlg) {
    var algResult = new GradientAlgResult();
    stepOne(dataForGradientAlg,algResult);
    stepTwo(dataForGradientAlg,algResult);
    mainRoot(dataForGradientAlg, algResult);
    return algResult;
}

function mainRoot(dataForGradientAlg, algResult){
    var sign = stepThree(dataForGradientAlg, algResult);
    //что-то проверить и закончить
    if(sign === '>'||sign === '='){return;}

    stepFour(dataForGradientAlg, algResult);
    stepFive(dataForGradientAlg, algResult);
    stepSix(dataForGradientAlg, algResult);
    stepSeven(dataForGradientAlg, algResult);
    stepEight(dataForGradientAlg, algResult);
    stepNine(dataForGradientAlg, algResult);
    stepTen(dataForGradientAlg, algResult);
}


//--------------------------CALCULATIONS-------------------------------------
function evclideNorm(arr) {
    let newArr = math.clone(arr);
    for (let i = 0; i < newArr.length; i++) {
        newArr[i] = math.pow(newArr[i],2);;
    }
    newArr = math.sum(newArr);
    newArr = math.sqrt(newArr);
    return newArr;
}

function getVariablesFromPolynom(expression) {
    let nodeExpr = math.parse(expression);
    let filtered = nodeExpr.filter(function (node) {
        return node.isSymbolNode
    });
    filtered = unique(filtered);
    return filtered;
}

function unique(arr) {
    let obj = {};

    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        obj[str] = true; // запомнить строку в виде свойства объекта
    }

    return Object.keys(obj); // или собрать ключи перебором для IE8-
}

function calulateDoubleDerivative(first, second,exprPolynomHtml) {

    let scope = {
        func: exprPolynomHtml.toString(),
        perOne: first,
        perTwo: second
    };
    return math.eval('derivative(derivative(func, perOne), perTwo)', scope);
}

function calculateDerivative(perem,exprPolynomHtml) {

    let scope = {
        func: exprPolynomHtml.toString(),
        perem: perem,
    };
    return math.eval('derivative(func, perem)', scope);
}

//------------------------------CLASES(OBJECTS)-------------------------------

function DataForGradientAlg(Fx,g1Expr,xZero1,xZero2,accuracy,maxIters){
    this.Fx = Fx;
    this.g1Expr = g1Expr;
    //this.g2Expr = g2Expr;
    //this.g2Value = g2Value;
    this.xZero = [xZero1,xZero2];
    this.accuracy = accuracy;
    this.maxIterations = maxIters;
    this.variablesFx = {};
    this.variablesg1 = {};
    this.numderOfIteration;
    this.xk;
    this.gradientG1;
    this.k;
    this.tk;
    this.sigma2Xk;
    this.evcideNormSigma2Xk;
    this.gradientFx;
}

function getPointG1ArgsXkValue(dataForGradientAlg) {
    let point={
        [dataForGradientAlg.variablesg1[0]]: dataForGradientAlg.xk[0],
        [dataForGradientAlg.variablesg1[1]]: dataForGradientAlg.xk[1]
    }
    return point;
}
function getPointFxArgsXkValue(dataForGradientAlg) {
    let point={
        [dataForGradientAlg.variablesFx[0]]: dataForGradientAlg.xk[0],
        [dataForGradientAlg.variablesFx[1]]: dataForGradientAlg.xk[1]
    }
    return point;
}

function GradientAlgResult(){
    this.stepsHtml = [];
    this.stepOne;
    this.stepTwo;
}

function Gradient(_first, _second,exprPolynomHtml) {
    this.first = calculateDerivative(_first,exprPolynomHtml);

    this.second = calculateDerivative(_second,exprPolynomHtml);
    this.point = [0, 0];

    this.gradientToString = function () {
        return '(' + this.first.toString() + ')*i+' + '(' + this.second.toString() + ')*j';
    }
    this.setGradientInPoint = function (_point) {
        let gradientInPointX = math.format((math.eval(this.first.toString(), _point)), {
            notation: 'fixed',
            precision: 2
        });
        let gradientInPointY = math.format((math.eval(this.second.toString(), _point)), {
            notation: 'fixed',
            precision: 2
        });
        this.point = [parseInt(gradientInPointX), parseInt(gradientInPointY)];
    }
    this.getGradientInPoint = function () {
        return this.point;
    }
    this.getLength = function () {
        return math.format(math.eval('sqrt(pow(' + this.point[0] + ',2)+pow(' + this.point[1] + ',2))'), {
            notation: 'fixed',
            precision: 2
        });
    }
}

function Matrix(first, second,exprPolynomHtml) {
    this.peremOne = calulateDoubleDerivative(first, first,exprPolynomHtml);
    this.peremTwo = calulateDoubleDerivative(first, second,exprPolynomHtml);
    this.peremThree = calulateDoubleDerivative(second, second,exprPolynomHtml);
    this.point = [[1, 1], [1, 1]];

    this.setPoint = function (_point) {
        let gradientInPointXX = math.format((math.eval(this.peremOne.toString(), _point)), {
            notation: 'fixed',
            precision: 2
        }).toString();
        let gradientInPointYY = math.format((math.eval(this.peremThree.toString(), _point)), {
            notation: 'fixed',
            precision: 2
        }).toString();
        let gradientInPointXY = math.format((math.eval(this.peremTwo.toString(), _point)), {
            notation: 'fixed',
            precision: 2
        }).toString();
        this.point = [[gradientInPointXX, gradientInPointXY], [gradientInPointXY, gradientInPointYY]];
    }
    this.getInPoint = function () {
        return this.stringMatrix(this.point[0][0], this.point[0][1], this.point[1][0], this.point[1][1]);
    }
    this.getMatrix = function () {

        return this.stringMatrix(this.peremOne, this.peremTwo, this.peremTwo, this.peremThree);
    }
    this.stringMatrix = function (perem1, perem2, perem3, perem4) {
        return '[[' + perem1 + ',' + perem2 + '], [' + perem3 + ', ' + perem4 + ']]';
    }
}

//-------------------------------VIEW-----------------------------------------
function viewGradientAlgResult(dataForGradientAlg,gradientAlgResult,outputHtml){
    outputHtml.innerHTML += setPrettyTr('Шаг 1',gradientAlgResult.stepOne,' ');
    outputHtml.innerHTML += setPrettyTr('Шаг 2',gradientAlgResult.stepTwo,' ');
    for (let i = 0; i < gradientAlgResult.stepsHtml.length; i++) {
        const element = gradientAlgResult.stepsHtml[i];
        outputHtml.innerHTML += element;
    }
}

function viewFxAndG1Pretty(dataForGradientAlg,prettyFxHtml,prettyG1Html) {
    prettyFxHtml.innerHTML += setPretty(dataForGradientAlg.Fx);
    prettyG1Html.innerHTML += setPretty(dataForGradientAlg.g1Expr);

}

function setPretty(value) {
    return '$$' + math.parse(value).toTex({parenthesis: parenthesis}) + '$$';
    //output.insertAdjacentHTML('beforeEnd', `<tr><th>Шаг 5</th><td><div>$$ ${math.parse(value).toTex({parenthesis: parenthesis})}
//$$</div></td></tr>`);
}

function setPrettyTrWithExpr(name, value, messageBefore, messageAfter) {
    //element.innerHTML = '$$' + math.parse(value).toTex({parenthesis: parenthesis}) + '$$';
    return `<tr><th>${name}</th><td><div>${messageBefore} ${math.parse(value).toTex({parenthesis: parenthesis})} ${messageAfter}</div></td></tr>`;
}
function setPrettyTr( name, messageBefore, messageAfter) {
    //element.innerHTML = '$$' + math.parse(value).toTex({parenthesis: parenthesis}) + '$$';
    return `<tr><th>${name}</th><td><div>${messageBefore} ${messageAfter}</div></td></tr>`;
}

function pointToString(coordinates) {
    let stringCoord = "(";
    for (let i = 0; i < coordinates.length - 1; i++) {
        stringCoord += coordinates[i] + " ; "
    }
    stringCoord += coordinates[coordinates.length - 1] + ")";
    return stringCoord;
}

function getSignOfСomparison(a, b) {
    if (a > b) {
        return ">";
    }
    if (a == b) {
        return "=";
    }
    if (a < b) {
        return "<";
    }
}

//-------------------------------OUTPUT---------------------------------------
function restart() {
    let nodesCount = output.childNodes.length;
    for (let i = 0; i < nodesCount - 2; i++) {
        output.removeChild(output.childNodes[2]);
    }
    document.getElementById('resultX') ? document.getElementById('resultX').remove() : console.log('resultX = null');

    let node = null;
        try {
            // parse the expression
            node = math.parse(exprPolynomHtml.value);

            // evaluate the result of the expression
            MarquardAlgorithm(exprPolynomHtml.value);
            MathJax.Hub.Typeset();
            //result.innerHTML = math.format(node.compile().eval());
        }
        catch (err) {
            output.insertAdjacentHTML('beforeEnd', `<tr><th colspan="2" align="center"><span style="color: red;">${err.toString()}</span></th></tr>`);
            //result.innerHTML = '<span style="color: red;">' + err.toString() + '</span>';
            console.log('<span style="color: red;">' + err.toString() + '</span>');
            MathJax.Hub.Typeset();
        }
}