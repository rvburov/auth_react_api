import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Eye, EyeOff, LogOut, UserCheck, Calendar, Shield } from 'lucide-react';

// API клиент
class APIClient {
  constructor(baseURL = 'http://127.0.0.1:8000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: { detail: 'Ошибка соединения с сервером' } };
    }
  }

  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        this.token = data.access_token;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: { detail: 'Ошибка соединения с сервером' } };
    }
  }

  async getProfile() {
    if (!this.token) {
      return { success: false, data: { detail: 'Не авторизован' } };
    }

    try {
      const response = await fetch(`${this.baseURL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      return { success: false, data: { detail: 'Ошибка соединения с сервером' } };
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }
}

// Компонент регистрации
const RegisterForm = ({ onSwitch, apiClient, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!formData.username || !formData.email || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);

    const result = await apiClient.register({
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    setLoading(false);

    if (result.success) {
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      onSwitch('login');
      alert('Регистрация успешна! Теперь можете войти в систему.');
    } else {
      setError(result.data.detail || 'Ошибка регистрации');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <UserCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Регистрация</h2>
        <p className="text-gray-600 mt-2">Создайте новый аккаунт</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя пользователя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите имя пользователя"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите пароль"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Подтверждение пароля
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Подтвердите пароль"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Регистрируем...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-gray-600">Уже есть аккаунт? </span>
        <button
          onClick={() => onSwitch('login')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Войти
        </button>
      </div>
    </div>
  );
};

// Компонент входа
const LoginForm = ({ onSwitch, apiClient, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);

    const result = await apiClient.login(formData);

    setLoading(false);

    if (result.success) {
      setUser(result.data.user);
      setFormData({ username: '', password: '' });
    } else {
      setError(result.data.detail || 'Ошибка входа');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Вход в систему</h2>
        <p className="text-gray-600 mt-2">Войдите в свой аккаунт</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя пользователя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите имя пользователя"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите пароль"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <span className="text-gray-600">Нет аккаунта? </span>
        <button
          onClick={() => onSwitch('register')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
};

// Компонент профиля
const ProfilePage = ({ user, apiClient, onLogout }) => {
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    const result = await apiClient.getProfile();

    setLoading(false);

    if (result.success) {
      setProfile(result.data);
    } else {
      setError(result.data.detail || 'Ошибка загрузки профиля');
      if (result.data.detail && result.data.detail.includes('Недействительные')) {
        onLogout();
      }
    }
  };

  const handleLogout = () => {
    apiClient.logout();
    onLogout();
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold">Профиль пользователя</h1>
                  <p className="text-blue-100">Добро пожаловать, {profile?.username}!</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>

          {/* Содержимое профиля */}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Основная информация</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID пользователя</label>
                    <p className="text-gray-900">{profile?.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Имя пользователя</label>
                    <p className="text-gray-900">{profile?.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{profile?.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Статистика</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Дата регистрации</label>
                      <p className="text-gray-900">{profile?.created_at ? formatDate(profile.created_at) : 'Не указана'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Статус</label>
                      <p className="text-green-600 font-medium">Активный</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={loadProfile}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Обновляем...' : 'Обновить профиль'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Главный компонент приложения
const App = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [apiClient] = useState(() => new APIClient());

  // Проверяем сохраненного пользователя при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView('profile');
      } catch (error) {
        console.error('Ошибка восстановления сессии:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleSwitchView = (view) => {
    setCurrentView(view);
  };

  const handleSetUser = (userData) => {
    setUser(userData);
    setCurrentView('profile');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  if (user && currentView === 'profile') {
    return (
      <ProfilePage 
        user={user} 
        apiClient={apiClient} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      {currentView === 'login' ? (
        <LoginForm 
          onSwitch={handleSwitchView} 
          apiClient={apiClient} 
          setUser={handleSetUser} 
        />
      ) : (
        <RegisterForm 
          onSwitch={handleSwitchView} 
          apiClient={apiClient} 
          setUser={handleSetUser} 
        />
      )}
    </div>
  );
};

export default App;