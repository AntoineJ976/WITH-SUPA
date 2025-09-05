import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CheckCircle, AlertCircle, Database, Shield, User, Wifi } from 'lucide-react';

const TestStatus: React.FC<{ test: string; passed: boolean }> = ({ test, passed }) => (
  <div className="flex items-center space-x-2">
    {passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )}
    <span className={`text-sm ${passed ? 'text-green-700' : 'text-red-700'}`}>
      {test}: {passed ? 'Connected' : 'Failed'}
    </span>
  </div>
);

export const FirebaseTest: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMessage('❌ Supabase not configured. Please check environment variables.');
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setMessage(`✅ User authenticated: ${session.user.email}`);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const runConnectionTest = async () => {
    const results: {[key: string]: boolean} = {};
    
    try {
      // Test 1: Supabase Configuration
      results.config = isSupabaseConfigured();
      
      // Test 2: Database Connection
      if (supabase) {
        try {
          const { data, error } = await supabase.from('users').select('count').limit(1);
          results.database = !error;
        } catch (error) {
          console.error('Database test failed:', error);
          results.database = false;
        }
      } else {
        results.database = false;
      }
      
      // Test 3: Auth Service
      results.auth = !!supabase;
      
      setTestResults(results);
      
      const allPassed = Object.values(results).every(Boolean);
      setMessage(allPassed ? '✅ All Supabase services connected successfully!' : '⚠️ Some Supabase services failed to connect');
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setMessage(`❌ Connection test failed: ${error}`);
    }
  };

  const handleCreateUser = async () => {
    if (!isSupabaseConfigured()) {
      setMessage('❌ Supabase not configured');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (error) throw error;

      // Add user data to database
      if (data.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email: email,
            role: 'test_user',
            profile: {
              first_name: 'Test',
              last_name: 'User'
            },
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (dbError) throw dbError;
      }

      setMessage(`✅ User created successfully: ${email}`);
    } catch (error: any) {
      console.error('Create user error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      setMessage('❌ Supabase not configured');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      setMessage(`✅ Signed in successfully: ${email}`);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setMessage(`❌ Sign in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage('✅ Signed out successfully');
    } catch (error: any) {
      setMessage(`❌ Sign out error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <div className={`rounded-xl p-6 border ${
        isSupabaseConfigured() 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start space-x-3">
          {isSupabaseConfigured() ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div>
            <h3 className={`text-sm font-medium mb-2 ${
              isSupabaseConfigured() ? 'text-green-900' : 'text-red-900'
            }`}>
              Supabase Status: {isSupabaseConfigured() ? 'Configured' : 'Not Configured'}
            </h3>
            {!isSupabaseConfigured() && (
              <div className="text-sm text-red-800 space-y-1">
                <p>Please click "Connect to Supabase" button in the top right corner to set up Supabase.</p>
                <p>Required environment variables will be automatically configured.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Tests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wifi className="h-5 w-5 mr-2 text-sky-500" />
            Connection Tests
          </h2>
          <button
            onClick={runConnectionTest}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Run Tests
          </button>
        </div>
        
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <TestStatus test="Configuration" passed={testResults.config} />
            <TestStatus test="Authentication" passed={testResults.auth} />
            <TestStatus test="Database" passed={testResults.database} />
          </div>
        )}
      </div>

      {/* Authentication Test */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="h-5 w-5 mr-2 text-emerald-500" />
          Authentication Test
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCreateUser}
              disabled={loading || !isSupabaseConfigured()}
              className="flex-1 bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create User & Store in Supabase'}
            </button>
            
            <button
              onClick={handleSignIn}
              disabled={loading || !isSupabaseConfigured()}
              className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            {user && (
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign Out
              </button>
            )}
          </div>

          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Authenticated as: {user.email}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.includes('❌') 
            ? 'bg-red-50 border border-red-200 text-red-800'
            : message.includes('⚠️')
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Database className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Supabase Setup Instructions
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>1.</strong> Click "Connect to Supabase" button in the top right corner</p>
              <p><strong>2.</strong> This will automatically configure your Supabase project</p>
              <p><strong>3.</strong> Enable Authentication (Email/Password) and create necessary tables</p>
              <p><strong>4.</strong> The environment variables will be set automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};