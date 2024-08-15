import React, { useState, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Home from '../components/Home'

const App = () => {
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: '#3D52A0', // Deep blue, inspired by the image
                        light: '#7091E6', // Lighter blue accent
                        dark: '#2A3B75', // Darker blue for contrast
                        contrastText: '#FFFFFF',
                    },
                    secondary: {
                        main: '#8697C4', // Soft blue-gray for secondary elements
                        light: '#A5B1D6',
                        dark: '#697EA6',
                        contrastText: '#FFFFFF',
                    },
                    background: {
                        default: mode === 'light' ? '#EDE8F5' : '#121212', // Very light lavender for light mode, dark for dark mode
                        paper: mode === 'light' ? '#FFFFFF' : '#1E1E1E',
                    },
                    text: {
                        primary: mode === 'light' ? '#333333' : '#FFFFFF',
                        secondary: mode === 'light' ? '#666666' : '#B0B0B0',
                    },
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    h1: {
                        fontSize: '3rem',
                        fontWeight: 300,
                        letterSpacing: '-0.01562em',
                    },
                    h2: {
                        fontSize: '2.5rem',
                        fontWeight: 300,
                        letterSpacing: '-0.00833em',
                    },
                    h3: {
                        fontSize: '2rem',
                        fontWeight: 400,
                        letterSpacing: '0em',
                    },
                    h4: {
                        fontSize: '1.75rem',
                        fontWeight: 400,
                        letterSpacing: '0.00735em',
                    },
                    h5: {
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        letterSpacing: '0em',
                    },
                    h6: {
                        fontSize: '1.25rem',
                        fontWeight: 500,
                        letterSpacing: '0.0075em',
                    },
                    subtitle1: {
                        fontSize: '1rem',
                        fontWeight: 400,
                        letterSpacing: '0.00938em',
                    },
                    subtitle2: {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        letterSpacing: '0.00714em',
                    },
                    body1: {
                        fontSize: '1rem',
                        fontWeight: 400,
                        letterSpacing: '0.00938em',
                    },
                    body2: {
                        fontSize: '0.875rem',
                        fontWeight: 400,
                        letterSpacing: '0.01071em',
                    },
                    button: {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        letterSpacing: '0.02857em',
                        textTransform: 'none',
                    },
                    caption: {
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        letterSpacing: '0.03333em',
                    },
                    overline: {
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        letterSpacing: '0.08333em',
                        textTransform: 'uppercase',
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
                                },
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                background: mode === 'light'
                                    ? 'linear-gradient(45deg, #3D52A0 30%, #7091E6 90%)'
                                    : 'linear-gradient(45deg, #1A237E 30%, #3949AB 90%)',
                                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
                            },
                        },
                    },
                },
            }),
        [mode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Header mode={mode} toggleColorMode={colorMode.toggleColorMode} />
                <div style={{ paddingTop: '64px' }}> {/* Add padding to account for fixed AppBar */}
                    <Switch>
                        <Route exact path="/" component={Home} />
                        {/* Add other routes here */}
                    </Switch>
                </div>
            </Router>
        </ThemeProvider>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    const root = createRoot(container);
    root.render(<App />);
});