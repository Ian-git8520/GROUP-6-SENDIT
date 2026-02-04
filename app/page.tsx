import Link from 'next/link'

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              SENDIT
            </h1>
            <p className="text-xl text-slate-300">
              Fast, reliable delivery management system
            </p>
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-lg p-8 mb-12 border border-slate-700">
            <p className="text-lg text-slate-200 mb-6">
              Welcome to SENDIT - a comprehensive delivery management platform that connects customers, drivers, and administrators in a seamless ecosystem.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-bold text-white mb-2">📦 For Customers</h3>
                <p className="text-slate-300 text-sm">Create and track deliveries in real-time</p>
              </div>
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-bold text-white mb-2">🚗 For Drivers</h3>
                <p className="text-slate-300 text-sm">Accept orders and manage deliveries</p>
              </div>
              <div className="bg-slate-700 rounded p-4">
                <h3 className="font-bold text-white mb-2">⚙️ For Admins</h3>
                <p className="text-slate-300 text-sm">Manage all orders and system operations</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://yourfrontend.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              Go to Application
            </a>
            <a
              href="https://yourbackend.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition border border-slate-600"
            >
              API Documentation
            </a>
          </div>

          {/* Setup Instructions */}
          <div className="mt-16 bg-slate-800 rounded-lg p-8 border border-slate-700 text-left max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
            <ol className="text-slate-300 space-y-4 list-decimal list-inside">
              <li>
                <strong>Start the Backend:</strong>
                <p className="ml-6 text-slate-400">Run <code className="bg-slate-900 px-2 py-1 rounded">python BACKEND/app.py</code></p>
              </li>
              <li>
                <strong>Start the Frontend:</strong>
                <p className="ml-6 text-slate-400">Run <code className="bg-slate-900 px-2 py-1 rounded">npm run dev</code> in the FRONTEND folder</p>
              </li>
              <li>
                <strong>Access the Application:</strong>
                <p className="ml-6 text-slate-400">Open <code className="bg-slate-900 px-2 py-1 rounded">http://localhost:5173</code></p>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-blue-900 border border-blue-700 rounded">
              <p className="text-blue-200">
                <strong>📚 Documentation:</strong> Check the documentation files for detailed API integration and system architecture.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-2xl">✓</span>
                <div>
                  <h3 className="font-bold text-white">JWT Authentication</h3>
                  <p className="text-slate-400 text-sm">Secure authentication with 12-hour token expiry</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-2xl">✓</span>
                <div>
                  <h3 className="font-bold text-white">Role-Based Access</h3>
                  <p className="text-slate-400 text-sm">Admin, User, and Driver roles with specific permissions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-2xl">✓</span>
                <div>
                  <h3 className="font-bold text-white">Real-Time Tracking</h3>
                  <p className="text-slate-400 text-sm">Track deliveries from pickup to delivery</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-2xl">✓</span>
                <div>
                  <h3 className="font-bold text-white">Database Persistence</h3>
                  <p className="text-slate-400 text-sm">SQLite database with proper migrations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-slate-700">
            <p className="text-slate-400">
              © 2024 SENDIT. A delivery management system.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
