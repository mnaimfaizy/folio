// A simple utility to provide consistent navigation in non-component files
// This allows services to use react-router navigation without direct hook access

let navigate: (path: string) => void;

export const registerNavigate = (navigateFunction: (path: string) => void) => {
  navigate = navigateFunction;
};

export const appNavigate = (path: string) => {
  if (navigate) {
    navigate(path);
  } else {
    console.warn(
      "Navigation function not registered. Using window.location as fallback."
    );
    window.location.href = path;
  }
};

export default appNavigate;
