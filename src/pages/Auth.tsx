import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Định nghĩa kiểu dữ liệu form
type AuthForm = {
  email: string;
  password: string;
};

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<AuthForm>>({});
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = (): boolean => {
    const tempErrors: Partial<AuthForm> = {};

    if (!form.email) {
      tempErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Email không hợp lệ";
    }

    if (!form.password) {
      tempErrors.password = "Mật khẩu không được để trống";
    } else if (form.password.length < 6) {
      tempErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    setMessage('');
    setIsLoading(true);
    const endpoint = isRegister ? "/sign-up" : "/sign-in";
    try {
      const response = await
        fetch(`${import.meta.env.VITE_API_SERVER}/user${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      
      if (data && data?.status == 200) {
        setMessage(isRegister ? "Đăng ký thành công!" : "Đăng nhập thành công!");
        setForm({ email: "", password: "" });  
        if (data?.data?.data) {
          localStorage.setItem("user", JSON.stringify(data?.data?.data));
          localStorage.setItem("accessToken", JSON.stringify(data?.data.tokens.accessToken.access));
          navigate("/");
        }
      } else {
        setMessage(data.message || data.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.log("error:::",error);
      setMessage("Lỗi kết nối tới server!");
    }finally{
      setIsLoading(false);
    }
  };




  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl transform transition-all hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Nút Submit */}
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
                {isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...'}
              </span>
            ) : (
              isRegister ? 'Đăng Ký' : 'Đăng Nhập'
            )}
          </button>

          {/* Thông báo */}
          {message && (
            <p className="text-center mt-6 bg-green-50 text-green-600 p-4 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          )}

          {/* Chuyển đổi giữa Đăng ký <-> Đăng nhập */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrors({});
                setMessage('');
              }}
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-all duration-200"
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </p>

          {/* Quên mật khẩu */}
          {!isRegister && (
            <p className="mt-4 text-center text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-all duration-200"
              >
                Quên mật khẩu
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;