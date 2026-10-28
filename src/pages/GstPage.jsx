import { ChevronLeft } from 'lucide-react';
import GstCalculator from '../components/calculator/GstCalculator.jsx';

export default function GstPage() {
  return (
    <section className="page">
      <div className="container">
        <a className="back" href="#/"><ChevronLeft size={18} aria-hidden="true" /> Back to home</a>
        <header className="page__head">
          <h1>GST Calculator</h1>
          <p>Add GST to a price, or find the GST inside a total. Results update as you type.</p>
        </header>
        <GstCalculator />
        <p className="page__note">
          The rates shown are common examples. The rate that applies to a product or service can differ, so confirm it with the official GST rate schedule or a tax professional.
        </p>
      </div>
    </section>
  );
}
