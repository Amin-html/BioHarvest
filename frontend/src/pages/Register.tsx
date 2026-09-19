import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})
type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    try {
      await registerUser(values.email, values.password)
      navigate('/')
    } catch {
      setServerError('Не удалось зарегистрироваться — возможно, email уже занят')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold text-emerald-700 mb-6">Регистрация</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('email')}
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="Пароль"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 text-white rounded-lg py-2 font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Создаём...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Уже есть аккаунт? <Link to="/login" className="text-emerald-600 font-medium">Войти</Link>
      </p>
    </div>
  )
}