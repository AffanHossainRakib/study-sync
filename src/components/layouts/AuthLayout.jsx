const AuthLayout = ({ children, imgSrc }) => {
  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative">
        <img
          src={imgSrc}
          alt="Authentication"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
