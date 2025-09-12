export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-secondary-50">
      {children}
    </div>
  );
}