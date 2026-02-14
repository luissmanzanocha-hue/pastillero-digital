import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', backgroundColor: '#0F172A', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                    <h1>Algo salió mal.</h1>
                    <p>La aplicación ha encontrado un error crítico.</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '5px' }}>
                        <summary>Ver detalles del error</summary>
                        <p>{this.state.error && this.state.error.toString()}</p>
                        <br />
                        <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2563EB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Recargar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
