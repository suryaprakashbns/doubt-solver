const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-medium text-gray-200">404</h1>
      <p className="text-gray-500 mt-4">This page doesn't exist.</p>
      <a href="/" className="mt-6 text-purple-600 hover:underline">
        Go back home
      </a>
    </div>
  )
}
export default NotFoundPage