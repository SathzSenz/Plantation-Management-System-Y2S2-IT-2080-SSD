import {
    ArrowUpCircleIcon,
    ArrowDownCircleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon

} from '@heroicons/react/24/solid';
import {
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from "react";
import axios from "axios";
import {Popover} from "antd";


const getWeekStartEnd = (date, startOfWeek) => {
    let weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + startOfWeek);
    weekStart.setHours(0, 0, 0, 0);

    let weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return { start: weekStart, end: weekEnd };
};

export default function FinanceTransactionsStatBar() {
    const [currentWeekData, setCurrentWeekData] = useState({
        transactions: 0,
        income: 0,
        expense: 0,
        profitLoss: 0,
    });
    const [previousWeekData, setPreviousWeekData] = useState({
        transactions: 0,
        income: 0,
        expense: 0,
        profitLoss: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const today = new Date();
        const currentWeek = getWeekStartEnd(today, 1); // Assuming week starts on Monday
        const lastWeek = getWeekStartEnd(new Date(today.setDate(today.getDate() - 7)), 1);

        setLoading(true);
        axios.get('http://localhost:5555/transactions')
            .then((response) => {
                const records = response.data.data;

                const filterAndSummarize = (start, end) => {
                    const filtered = records.filter(record => {
                        const recordDate = new Date(record.date);
                        return recordDate >= start && recordDate <= end;
                    });
                    const income = filtered.filter(record => record.type === 'income').reduce((acc, record) => acc + record.amount, 0);
                    const expense = filtered.filter(record => record.type === 'expense').reduce((acc, record) => acc + record.amount, 0);
                    return {
                        transactions: filtered.length,
                        income,
                        expense,
                        profitLoss: income - expense,
                    };
                };

                setCurrentWeekData(filterAndSummarize(currentWeek.start, currentWeek.end));
                setPreviousWeekData(filterAndSummarize(lastWeek.start, lastWeek.end));

                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, []);

    const renderIcon = (current, previous) => {
        if (current >= previous)  {
            return <ArrowUpCircleIcon className="w-8 h-8 text-lime-500" />;
        } else {
            return <ArrowDownCircleIcon className="w-8 h-8 text-red-600" />;
        }
    };

    const renderExpenseIcon = (current, previous) => {
        if (current >= previous)  {
            return <ArrowUpCircleIcon className="w-8 h-8 text-red-600" />;
        } else {
            return <ArrowDownCircleIcon className="w-8 h-8 text-lime-500" />;
        }
    };

    const renderProfitLossIcon = (profitLoss) => {
        if (profitLoss >= 0)  {
            return <CheckCircleIcon className="w-8 h-8 text-lime-500" />;
        } else {
            return <ExclamationCircleIcon className="w-8 h-8 text-red-600" />;
        }
    };

    const renderProfitLoss = (profitOrLoss) => {
        // Convert the formatted string back to a number
        const profitOrLossNumber = parseFloat(profitOrLoss.replace(/,/g, ''));
        const colorClass = profitOrLossNumber >= 0 ? 'text-lime-500' : 'text-red-600';
        return <span className={`${colorClass} text-xl font-semibold tracking-tight sm:text-3xl`}>Rs.{profitOrLoss}</span>;
    };

    function calculatePercentageChange(currentIncome, previousIncome) {
        const percentageChange = ((currentIncome - previousIncome) / previousIncome) * 100;
        return percentageChange.toFixed(2); // Round to 2 decimal places
    }


    return (
        <div className="relative py-8 sm:py-8 overflow-hidden ">
            {/* Additional divs and elements for styling omitted for brevity */}
            <div
                className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/4 transform-gpu blur-2xl"
                aria-hidden="true"
            >
                <div
                    className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#f43f5e] to-[#84cc16] opacity-30"
                    style={{
                        clipPath:
                            'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
                    }}
                />
            </div>
            <div
                className="absolute left-[max(45rem,calc(50%+8rem))] top-1/4 -z-10 -translate-y-1/2 -translate-x-1/4 transform-gpu blur-2xl"
                aria-hidden="true"
            >
                <div
                    className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#f43f5e] to-[#84cc16]
         opacity-30"
                    style={{
                        clipPath:
                            'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
                    }}
                />
            </div>

            <div className="flex flex-row">
                <div className="mx-auto w-full px-6 lg:px-8 relative flex flex-row ">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-1">
                        {/* Transactions this week */}
                        <div className="flex flex-row items-center gap-4">
                            <dd className="text-xl font-semibold text-gray-900 tracking-tight sm:text-3xl">
                                {currentWeekData.transactions}
                            </dd>
                            {renderIcon(currentWeekData.transactions, previousWeekData.transactions)}
                        </div>
                        <dt className="text-base leading-7 text-gray-900">Transactions this week</dt>
                    </div>

                    <div className="mx-auto flex  flex-col gap-y-1">
                        {/* Income this week */}
                        <div className="flex flex-row items-center gap-8">
                            <dd className="text-xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                                Rs. {currentWeekData.income.toLocaleString()}
                            </dd>

                            {renderIcon(currentWeekData.income, previousWeekData.income)}
                        </div>
                        <div className="flex flex-row items-center gap-12 justify-between">
                            <dt className="text-base leading-7 text-gray-900">Income this week</dt>
                            <p className="text-sm text-gray-600 font-light">{calculatePercentageChange(currentWeekData.income, previousWeekData.income)}%</p>

                        </div>

                    </div>

                    <div className="mx-auto flex max-w-xs flex-col gap-y-1">
                        {/* Expense this week */}
                        <div className="flex flex-row items-center gap-8">
                            <dd className="text-xl font-semibold text-gray-900 tracking-tight sm:text-3xl">
                                Rs.{currentWeekData.expense.toLocaleString()}
                            </dd>
                            {renderExpenseIcon(currentWeekData.expense, previousWeekData.expense)}
                        </div>
                        <div className="flex flex-row items-center gap-12">
                            <dt className="text-base leading-7 text-gray-900">Expense this week</dt>
                            <p className="text-sm text-gray-600 font-light">{calculatePercentageChange(currentWeekData.expense, previousWeekData.expense)}%</p>

                        </div>

                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-1">
                        {/* Expense this week */}
                        <div className="flex flex-row items-center gap-4">
                            <dd className="text-xl font-semibold text-gray-900 tracking-tight sm:text-3xl">
                                {renderProfitLoss(currentWeekData.profitLoss.toLocaleString())}

                            </dd>
                            {renderProfitLossIcon(currentWeekData.profitLoss)}
                        </div>
                        <dt className="text-base leading-7 text-gray-900">Profit/Loss this week</dt>
                    </div>
                </div>
                <div className="pr-8 text-gray-600">
                    <Popover content={
                        <div>
                            <p className="text-sm text-gray-500 font-semibold">Transactions this week</p>
                            <p className="text-gray-500">Displays the number of transactions that<br/>happened in the
                                current week started<br/> from Monday and
                                ending in Sunday.</p>
                            <br/>
                            <p className="text-sm text-gray-500 font-semibold">Income this week</p>
                            <p className="text-gray-500">Displays the sum of income records that<br/>
                                happened within this week.</p>
                            <br/>
                            <p className="text-sm text-gray-500 font-semibold">Expenses this week</p>
                            <p className="text-gray-500">Displays the sum of expense records that<br/>
                                happened within
                                this week.</p>
                            <br/>
                            <p className="text-sm text-gray-500 font-semibold">Profit/Loss this week</p>
                            <p className="text-gray-500">Displays the profit/loss that happened<br/>
                                within this week. Calculated by<br/> subtracting expense from income.</p>
                            <br/>
                            <p className="text-sm text-gray-500 font-semibold">Percentages</p>
                            <p className="text-gray-500">Calculated by comparing the current week's<br/> data to
                                previous week's data.</p>

                            <br/>
                            <p className="text-sm text-gray-500 font-semibold">Arrow Icons</p>
                            <p className="text-gray-500">Arrow points up if the current weeks<br/>
                                value is increased compared to the previous<br/>
                                week's value.</p>
                        </div>
                    } title={
                        <div className="text-base text-gray-500 flex flex-row gap-2"><InformationCircleIcon className="w-6 h-6 stroke-gray-500"/>Statistics Bar
                    </div>}>
                        <div className="pr-8">
                            <InformationCircleIcon className="w-6 h-6 stroke-gray-500"/>
                        </div>
                    </Popover>
                </div>
            </div>

        </div>
    )
}
