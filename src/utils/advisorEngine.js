// AI Smart Advisor & Insights Engine for Kalkivo
// Computes intelligent, personalized financial, tax, and health recommendations.

import { formatINR } from './gstEngine.js';
import { emi as calculateEmi } from './finance.js';

const money = (n) => {
  if (!Number.isFinite(n)) return '₹0';
  return formatINR(Math.round(n * 100));
};

export function generateInsights({ calculatorId, values = {}, result = {} }) {
  const insights = [];

  switch (calculatorId) {
    case 'emi': {
      const p = Number(values.principal) || 0;
      const r = Number(values.rate) || 0;
      const tenureMonths = values.unit === 'years' ? (Number(values.tenure) || 0) * 12 : Number(values.tenure) || 0;

      if (p > 0 && r > 0 && tenureMonths > 0) {
        try {
          const currentEmi = calculateEmi({ principal: p, rate: r, months: tenureMonths });
          // Prepayment simulation: what if user pays 10% extra each month?
          const extraEmi = Math.round(currentEmi.emi * 0.1);
          const newMonthly = currentEmi.emi + extraEmi;
          const monthlyRate = r / 12 / 100;

          // Estimate months saved with extra payment
          let balance = p;
          let m = 0;
          let totalInterestPaid = 0;
          while (balance > 0 && m < tenureMonths) {
            m++;
            const interest = balance * monthlyRate;
            totalInterestPaid += interest;
            const principalPaid = Math.min(balance, newMonthly - interest);
            balance -= principalPaid;
            if (balance <= 0) break;
          }

          const monthsSaved = Math.max(0, tenureMonths - m);
          const interestSaved = Math.max(0, currentEmi.interest - totalInterestPaid);

          if (monthsSaved > 2 && interestSaved > 500) {
            insights.push({
              badge: '💰 Money Saver Hack',
              type: 'save',
              title: `Save ${money(interestSaved)} with a 10% Extra Prepayment`,
              text: `Paying just ${money(extraEmi)} extra per month closes your loan ${monthsSaved} months (${(monthsSaved / 12).toFixed(1)} years) early and saves ${money(interestSaved)} in interest!`,
            });
          }

          // Debt-to-income safety benchmark (50/30/20 rule)
          const recommendedMinIncome = Math.round(currentEmi.emi * 2.5);
          insights.push({
            badge: '🛡️ Financial Health Check',
            type: 'tip',
            title: 'Recommended Monthly Income',
            text: `For a stress-free financial profile, your total EMIs shouldn't exceed 40% of net income. This EMI of ${money(currentEmi.emi)} is healthiest with a monthly take-home of at least ${money(recommendedMinIncome)}.`,
          });
        } catch {}
      }
      break;
    }

    case 'sip': {
      const monthly = Number(values.monthly) || 0;
      const rate = Number(values.rate) || 12;
      const years = values.unit === 'months' ? (Number(values.duration) || 0) / 12 : Number(values.duration) || 0;

      if (monthly > 0 && years > 0) {
        const stepUpBonusPercent = Math.min(75, Math.round(years * 3.5));
        insights.push({
          badge: '🚀 Step-Up Wealth Booster',
          type: 'save',
          title: `Boost wealth by ~${stepUpBonusPercent}% with a 10% Annual Step-Up`,
          text: `Increasing your SIP by just 10% every year (e.g. adding ${money(Math.round(monthly * 0.1))} next year) takes advantage of compounding and can increase your maturity corpus by ~${stepUpBonusPercent}%.`,
        });

        insights.push({
          badge: '📈 Inflation Reality Check',
          type: 'tip',
          title: 'Beating Inflation',
          text: `At an expected ${rate}% return, your SIP comfortably outperforms historical inflation (~6% in India), helping you build real purchasing power rather than losing value in traditional savings.`,
        });
      }
      break;
    }

    case 'income-tax': {
      const income = Number(values.income) || 0;
      const isSalaried = values.salaried === 'yes';

      if (income > 0) {
        if (income <= 1275000 && isSalaried) {
          insights.push({
            badge: '🎉 Zero Tax Advantage',
            type: 'save',
            title: '100% Tax-Free under New Regime',
            text: `With the ₹75,000 standard deduction under the New Regime for FY 2026-27, your taxable income qualifies for Section 87A rebate — meaning zero income tax payable!`,
          });
        } else {
          insights.push({
            badge: '⚖️ Tax Regime Strategy',
            type: 'tip',
            title: 'New vs Old Regime Decision',
            text: `Under the New Regime, you don't need to lock money into ELSS, PPF, or high-premium insurance just for tax savings. Invest your surplus freely in liquid or higher-yield assets instead.`,
          });
        }
      }
      break;
    }

    case 'bmi': {
      const weight = Number(values.weight) || 0;
      const height = Number(values.height) || 0;

      if (weight > 0 && height > 0) {
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);

        if (bmi >= 25) {
          const targetWeight = 24.9 * (heightM * heightM);
          const diffKg = Math.round((weight - targetWeight) * 10) / 10;
          const safeWeeks = Math.max(3, Math.round(diffKg / 0.5)); // 0.5kg per week safe loss

          insights.push({
            badge: '🎯 Actionable Weight Target',
            type: 'health',
            title: `Lose ${diffKg} kg to reach your Healthy Normal Range`,
            text: `A safe, sustainable calorie deficit of ~400 kcal/day combined with 8,000–10,000 daily steps can help you reach normal weight in about ${safeWeeks} weeks without extreme dieting.`,
          });
        } else if (bmi < 18.5) {
          const targetWeight = 18.5 * (heightM * heightM);
          const diffKg = Math.round((targetWeight - weight) * 10) / 10;
          insights.push({
            badge: '🥗 Healthy Weight Gain Goal',
            type: 'health',
            title: `Gain ${diffKg} kg to enter the Optimal Health Zone`,
            text: `Focus on nutrient-dense whole foods (nuts, whole grains, eggs, paneer/tofu) and resistance training 3x/week to build healthy lean muscle mass.`,
          });
        } else {
          insights.push({
            badge: '✨ Optimal Health Status',
            type: 'health',
            title: 'You are in the Ideal Health Zone!',
            text: `Your BMI is in the healthy range (18.5–24.9). Maintain metabolic health by prioritizing 7–8 hours of quality sleep, hydration, and consistent weekly physical activity.`,
          });
        }
      }
      break;
    }

    case 'gst': {
      insights.push({
        badge: '📑 Input Tax Credit (ITC) Tip',
        type: 'tip',
        title: 'B2B Business Tax Credit',
        text: `If you operate a GST-registered business, ensure this transaction is billed with your GSTIN. You can claim the GST portion as Input Tax Credit (ITC) in GSTR-3B to offset your output tax liability.`,
      });
      break;
    }

    case 'discount': {
      insights.push({
        badge: '🛍️ Shopping Savvy',
        type: 'save',
        title: 'Effective Total Discount',
        text: `Successive discounts compound on the reduced amount, not the original price. Compare final prices across competing retailers to maximize savings.`,
      });
      break;
    }

    case 'profit-loss': {
      insights.push({
        badge: '📊 Margin Optimization',
        type: 'tip',
        title: 'Margin vs Markup Insight',
        text: `Margin is based on selling price, while markup is based on cost. To improve your profit margin by 3–5%, negotiate bulk raw material discounts or bundle complementary products.`,
      });
      break;
    }

    case 'age': {
      insights.push({
        badge: '⏳ Life Perspective',
        type: 'tip',
        title: 'Time & Health Wealth',
        text: `Time is our most valuable asset! Regularly check in on personal goals, health habits, and financial compounding as every year counts towards long-term freedom.`,
      });
      break;
    }

    case 'salary': {
      insights.push({
        badge: '💼 Retirement Compounding',
        type: 'save',
        title: 'The Power of Employee PF',
        text: `Your mandatory 12% EPF deduction compounds at a government-backed interest rate (~8.25%), providing a completely tax-free retirement corpus under current rules.`,
      });
      break;
    }

    default:
      break;
  }

  return insights;
}
