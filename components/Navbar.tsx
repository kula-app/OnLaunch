import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Button from "@mui/material/Button";
import { signOut } from 'next-auth/react';
import { useRouter } from "next/router";
import Routes from "../routes/routes";

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  hasSession: boolean;
}

const drawerWidth = 240;
const navItems = [{ id: "home", link: "/", label: "Home" },
                  { id: "profile", link: "/profile", label: "Profile"}];

export default function Navbar(props: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function navigateToAuthPage() {
    router.push(Routes.AUTH);
  }

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        OnLaunch
      </Typography>
      <Divider />
      {props.hasSession && navItems.map((item) => (
        <Link key={item.id} href={item.link}>
          {item.label}
        </Link>
      ))}
      {props.hasSession && 
        <Link key={navItems.length} href="/auth">
          Login
        </Link>}
    </Box>
  );
  
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            OnLaunch
          </Typography>
          {props.hasSession && <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.link} 
                style={{ color: "#fff", marginRight: 20 }}>
                {item.label}
              </Link>
            ))}
          </Box>}
          {props.hasSession && 
              <Button
                variant="outlined"
                color="info"
                sx={{ backgroundColor: "white" }}
                onClick={() => {
                  signOut({
                    redirect: false
                  });
                  navigateToAuthPage();
                }}
              >
                logout
              </Button>
            }
            {(!props.hasSession) && 
              <Button
                variant="outlined"
                color="info"
                sx={{ backgroundColor: "white" }}
                onClick={() => navigateToAuthPage()}
              >
                login
              </Button>
            }
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={undefined}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
