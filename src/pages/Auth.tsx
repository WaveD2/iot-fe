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

    const endpoint = isRegister ? "/sign-up" : "/sign-in";
    try {
      const response = await fetch(`http://localhost:4000/api/user${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log("data::",data);
      
      if (data && data?.status == 200) {
        setMessage(isRegister ? "Đăng ký thành công!" : "Đăng nhập thành công!");
        setForm({ email: "", password: "" });  
        if (data?.data) {
          localStorage.setItem("user", JSON.stringify(data.data));
          navigate("/");
        }
      } else {
        setMessage(data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.log("error:::",error);
      setMessage("Lỗi kết nối tới server!");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isRegister ? "Đăng Ký" : "Đăng Nhập"}
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto bg-white p-8 rounded-md shadow-md">
        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Mật khẩu */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu</label>
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Nút Submit */}
        <button
          className="w-full bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-300"
          type="submit"
        >
          {isRegister ? "Đăng Ký" : "Đăng Nhập"}
        </button>

        {/* Thông báo */}
        {message && <p className="text-center mt-4 text-green-600">{message}</p>}

        {/* Chuyển đổi giữa Đăng ký <-> Đăng nhập */}
        <p className="mt-4 text-center text-sm">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrors({});
              setMessage("");
            }}
            className="text-indigo-500 font-semibold hover:underline"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;
