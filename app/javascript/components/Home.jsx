// app/javascript/components/Home.jsx
import React from 'react';
import { Typography, Button, Grid, Paper, Box, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    Welcome to <span style={{ color: 'primary.main' }}>FairShare</span>
                </Typography>
                <Typography variant="h5" component="p" gutterBottom>
                    Your go-to platform for easy expense sharing and group finance management.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button variant="contained" color="primary" component={Link} to="/signup">
                        Sign Up
                    </Button>
                    <Button variant="outlined" color="primary" component={Link} to="/login">
                        Log In
                    </Button>
                </Box>
            </Box>

            <Box sx={{ my: 8 }}>
                <Typography variant="h3" gutterBottom align="center">
                    Why Choose FairShare?
                </Typography>
                <Grid container spacing={4}>
                    {[
                        { title: "Easy Group Management", description: "Create and manage multiple groups for different occasions or shared living situations." },
                        { title: "Effortless Expense Tracking", description: "Add and categorize expenses quickly, keeping a clear record of all shared costs." },
                        { title: "Smart Balance Calculation", description: "Automatically calculate who owes what, eliminating the hassle of manual calculations." },
                        { title: "Simplified Settlements", description: "Easily settle up with friends and keep track of who has paid their share." }
                    ].map((feature, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography>
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Add more sections as needed */}
        </Container>
    );
};

export default Home;