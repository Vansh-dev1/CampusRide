import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-100 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Share Rides, Save Money, Make Friends
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            The easiest way to find ride-sharing partners within your college campus
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-lg bg-teal-700 px-6 py-3 text-sm font-medium text-white hover:bg-teal-800"
            >
              Get Started
            </Link>
            <a
              href="#why"
              className="rounded-lg bg-slate-200 px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section id="why" className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold">Why Choose CampusRide?</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureCard icon="🎯" title="Easy Ride Posting" desc="Post your ride in seconds with destination, time, and fare details" />
            <FeatureCard icon="🔍" title="Smart Search" desc="Find rides matching your route and schedule instantly" />
            <FeatureCard icon="💰" title="Save Money" desc="Share costs with fellow students traveling the same route" />
            <FeatureCard icon="🛡️" title="Campus Community" desc="Exclusive to verified college students for safety" />
            <FeatureCard icon="⭐" title="Rating System" desc="Build trust with user ratings and reviews" />
            <FeatureCard icon="📱" title="Real-time Updates" desc="Get instant notifications for ride requests and updates" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-200/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold text-slate-800">How It Works</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard n="1" title="Sign Up" desc="Register with your college email ID" />
            <StepCard n="2" title="Post or Search" desc="Post your ride or search for available rides" />
            <StepCard n="3" title="Connect" desc="Request or accept ride requests" />
            <StepCard n="4" title="Share the Ride" desc="Share your journey and split the fare" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h3 className="text-2xl font-semibold">Ready to Start Sharing Rides?</h3>
          <p className="mx-auto mt-2 max-w-2xl text-white/90">
            Join CampusRide today and connect with fellow students
          </p>
          <div className="mt-7">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-lg bg-white px-7 py-3 text-sm font-semibold text-teal-800 hover:bg-slate-100"
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">🚗</span>
          <span className="text-lg font-semibold text-teal-800">CampusRide</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-700 text-lg font-bold text-white">
        {n}
      </div>
      <h4 className="mt-5 text-base font-semibold text-slate-800">{title}</h4>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600">
        <div>© {new Date().getFullYear()} CampusRide. All rights reserved.</div>
        <div className="mt-2">Connecting students, one ride at a time 🚗</div>
      </div>
    </footer>
  );
}
