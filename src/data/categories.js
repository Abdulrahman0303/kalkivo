import { Sigma, Landmark, Receipt, ArrowRightLeft, Wrench } from 'lucide-react';

export const categories = [
  { id: 'basic-math', name: 'Basic Math', icon: Sigma, color: '#2F4BFF', span: 3,
    blurb: 'Standard, percentage, average and more.', examples: ['Standard', 'Percentage', 'Average'] },
  { id: 'finance', name: 'Finance', icon: Landmark, color: '#0E9F6E', span: 3,
    blurb: 'Plan loans, savings and investments.', examples: ['EMI', 'Simple interest', 'Compound interest'] },
  { id: 'gst-tax', name: 'GST & Tax', icon: Receipt, color: '#D97706', span: 2,
    blurb: 'Add or remove GST from any price.', examples: ['GST', 'Income tax'] },
  { id: 'conversions', name: 'Conversions', icon: ArrowRightLeft, color: '#7C3AED', span: 2,
    blurb: 'Length, weight, temperature and more.', examples: ['Length', 'Weight', 'Temperature'] },
  { id: 'everyday-tools', name: 'Everyday Tools', icon: Wrench, color: '#DB2777', span: 2,
    blurb: 'Age, date difference, BMI and utilities.', examples: ['Age', 'Date difference', 'BMI'] },
];
