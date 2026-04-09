interface ToastProps {
  message: string;
}

const Toast = ({ message }: ToastProps) => {
  if (!message) return null;

  return (
    <div className="fixed right-5 top-5 z-[70] rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors duration-300 dark:bg-emerald-500">
      {message}
    </div>
  );
};

export default Toast;
