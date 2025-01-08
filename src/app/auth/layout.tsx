export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
