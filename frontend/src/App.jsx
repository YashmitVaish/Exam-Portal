import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RootRedirect from './pages/RootRedirect'

// Auth
import AuthPage from './pages/auth/AuthPage'

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ExamForm from './pages/teacher/ExamForm'
import ResultsPage from './pages/teacher/ResultsPage'
import AnalyticsPage from './pages/teacher/AnalyticsPage'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import TakeExam from './pages/student/TakeExam'
import ResultView from './pages/student/ResultView'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<AuthPage />} />

          {/* Authenticated shell */}
          <Route element={<Layout />}>
            <Route index element={<RootRedirect />} />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/exams/new"
              element={
                <ProtectedRoute role="teacher">
                  <ExamForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/exams/:id/edit"
              element={
                <ProtectedRoute role="teacher">
                  <ExamForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/exams/:id/results"
              element={
                <ProtectedRoute role="teacher">
                  <ResultsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/exams/:id/analytics"
              element={
                <ProtectedRoute role="teacher">
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exam/:id"
              element={
                <ProtectedRoute role="student">
                  <TakeExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/result"
              element={
                <ProtectedRoute role="student">
                  <ResultView />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
