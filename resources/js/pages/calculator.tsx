import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import HeroBackground from '@/components/hero-background';

type HistoryItem = {
    id: number;
    expression: string;
    result: string;
};

function CalcButton({ onClick, className, children }: { onClick: () => void; className?: string; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`h-14 rounded-xl text-lg font-semibold transition-all active:scale-95 ${className}`}
        >
            {children}
        </button>
    );
}

export default function CalculatorPage() {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [expression, setExpression] = useState('');
    const mainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mainRef.current) {
            gsap.fromTo(
                mainRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
            );
        }
    }, []);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);

            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDot = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);

            return;
        }

        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
        setExpression('');
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const performOperation = (nextOperation: string) => {
        const inputValue = parseFloat(display);
        const opSymbol = nextOperation === '*' ? '×' : nextOperation === '/' ? '÷' : nextOperation;

        if (previousValue === null) {
            setPreviousValue(inputValue);
            setExpression(`${display} ${opSymbol}`);
        } else if (operation) {
            const currentValue = previousValue;
            let result: number;

            switch (operation) {
                case '+':
                    result = currentValue + inputValue;
                    break;
                case '-':
                    result = currentValue - inputValue;
                    break;
                case '*':
                    result = currentValue * inputValue;
                    break;
                case '/':
                    result = inputValue !== 0 ? currentValue / inputValue : 0;
                    break;
                default:
                    result = inputValue;
            }

            setDisplay(String(result));
            setPreviousValue(result);
            setExpression(`${result} ${opSymbol}`);
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const calculate = () => {
        if (!operation || previousValue === null) {
            return;
        }

        const inputValue = parseFloat(display);
        const opSymbol = operation === '*' ? '×' : operation === '/' ? '÷' : operation;
        let result: number;

        switch (operation) {
            case '+':
                result = previousValue + inputValue;
                break;
            case '-':
                result = previousValue - inputValue;
                break;
            case '*':
                result = previousValue * inputValue;
                break;
            case '/':
                result = inputValue !== 0 ? previousValue / inputValue : 0;
                break;
            default:
                result = inputValue;
        }

        const historyExpression = `${previousValue} ${opSymbol} ${inputValue} =`;
        const resultStr = String(result);

        setHistory((prev) => [
            { id: Date.now(), expression: historyExpression, result: resultStr },
            ...prev,
        ]);

        setDisplay(resultStr);
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(true);
        setExpression('');
    };

    const percentage = () => {
        const currentValue = parseFloat(display);
        setDisplay(String(currentValue / 100));
    };

    const toggleSign = () => {
        const currentValue = parseFloat(display);
        setDisplay(String(currentValue * -1));
    };

    return (
        <>
            <Head title="Calculator" />
            <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-7" ref={mainRef}>
                <section className="relative isolate flex flex-col justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/50">
                    <HeroBackground />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Calculator</h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Quick calculations
                        </p>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
                        <div className="mb-4 rounded-xl bg-slate-950 p-4 text-right">
                            {expression && (
                                <div className="mb-1 text-sm text-slate-400">
                                    {expression}
                                </div>
                            )}
                            <div className="truncate text-4xl font-bold tracking-tight text-white">
                                {display}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <CalcButton onClick={clear} className="bg-slate-700 hover:bg-slate-600 text-white">
                                AC
                            </CalcButton>
                            <CalcButton onClick={toggleSign} className="bg-slate-700 hover:bg-slate-600 text-white">
                                +/-
                            </CalcButton>
                            <CalcButton onClick={percentage} className="bg-slate-700 hover:bg-slate-600 text-white">
                                %
                            </CalcButton>
                            <CalcButton onClick={() => performOperation('/')} className={`${operation === '/' && waitingForOperand ? 'bg-teal-500' : 'bg-teal-600 hover:bg-teal-500'} text-white`}>
                                /
                            </CalcButton>

                            <CalcButton onClick={() => inputDigit('7')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                7
                            </CalcButton>
                            <CalcButton onClick={() => inputDigit('8')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                8
                            </CalcButton>
                            <CalcButton onClick={() => inputDigit('9')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                9
                            </CalcButton>
                            <CalcButton onClick={() => performOperation('*')} className={`${operation === '*' && waitingForOperand ? 'bg-teal-500' : 'bg-teal-600 hover:bg-teal-500'} text-white`}>
                                *
                            </CalcButton>

                            <CalcButton onClick={() => inputDigit('4')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                4
                            </CalcButton>
                            <CalcButton onClick={() => inputDigit('5')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                5
                            </CalcButton>
                            <CalcButton onClick={() => inputDigit('6')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                6
                            </CalcButton>
                            <CalcButton onClick={() => performOperation('-')} className={`${operation === '-' && waitingForOperand ? 'bg-teal-500' : 'bg-teal-600 hover:bg-teal-500'} text-white`}>
                                -
                            </CalcButton>

                            <CalcButton onClick={() => inputDigit('1')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                1
                            </CalcButton>
                            <CalcButton onClick={() => inputDigit('2')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                2
                            </CalcButton>
                            <CalcButton onClick={() => inputDigit('3')} className="bg-slate-800 hover:bg-slate-700 text-white">
                                3
                            </CalcButton>
                            <CalcButton onClick={() => performOperation('+')} className={`${operation === '+' && waitingForOperand ? 'bg-teal-500' : 'bg-teal-600 hover:bg-teal-500'} text-white`}>
                                +
                            </CalcButton>

                            <CalcButton onClick={() => inputDigit('0')} className="col-span-2 bg-slate-800 hover:bg-slate-700 text-white">
                                0
                            </CalcButton>
                            <CalcButton onClick={inputDot} className="bg-slate-800 hover:bg-slate-700 text-white">
                                .
                            </CalcButton>
                            <CalcButton onClick={calculate} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/25">
                                =
                            </CalcButton>
                        </div>
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/30">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold">History</h2>
                            {history.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                        <div className="max-h-[500px] space-y-2 overflow-y-auto">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8">
                                    <p className="text-sm text-slate-400">No calculations yet</p>
                                    <p className="text-xs text-slate-500">Start calculating to see history</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 transition-colors hover:bg-slate-800/50"
                                    >
                                        <p className="text-sm text-slate-400">{item.expression}</p>
                                        <p className="text-lg font-bold text-teal-400">{item.result}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

CalculatorPage.layout = {
    breadcrumbs: [{ title: 'Calculator', href: '/calculator' }],
};
