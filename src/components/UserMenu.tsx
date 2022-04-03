import React, { useCallback } from 'react'
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { Typography } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web'


const UserMenu = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const { keycloak } = useKeycloak()

    const logout = useCallback(() => {
        keycloak?.logout()
    }, [keycloak])

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu}>
                    <Avatar alt="Remy Sharp" src={require('../resources/Profile.png')}/>
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                
                    <MenuItem key={'settings'} onClick={handleCloseUserMenu}>
                        <Typography textAlign="center">settings</Typography>
                    </MenuItem>
                    <MenuItem key={'logout'} onClick={logout}>
                        <Typography textAlign="center">logout</Typography>
                    </MenuItem>
            
            </Menu>
        </Box>
    )
}

export default UserMenu