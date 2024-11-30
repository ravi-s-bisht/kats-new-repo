"use client";

import { Logo } from "./logo";
import {
  Avatar,
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useRef, useState } from "react";
import { deepOrange } from "@mui/material/colors";

const aCx =
  "underline decoration-primary-400/0 hover:decoration-primary-400 underline-offset-4 transition-all duration-300";

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <header
      id="header"
      className="bg-white w-full flex self-start items-center p-[10px] justify-between shadow-sm border-gray-200 border-b"
    >
      <div className="group flex gap-8 justify-between items-center w-full">
        <span className="rounded-xl p-2 ml-8 flex place-content-center transition-all bg-white">
          <Logo className="w-[42px] h-auto aspect-square" />
        </span>
        {/* <nav className="pointer-events-none flex-row items-center gap-8 text-lg leading-7 hidden group-hover:flex group-hover:pointer-events-auto">
          <a href="https://bots.daily.co" target="_blank" className={aCx}>
            Dashboard
          </a>
          <a
            href="https://github.com/daily-demos/daily-bots-web-demo"
            target="_blank"
            className={aCx}
          >
            Source code
          </a>
        </nav> */}
        <div className="mr-5">
          <Button
            ref={anchorRef}
            id="composition-button"
            aria-controls={open ? "composition-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <Avatar
              sx={{
                bgcolor: deepOrange[500],
                width: 35,
                height: 35,
                fontSize: 20,
              }}
            >
              N
            </Avatar>
          </Button>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
            sx={{ zIndex: 9999 }}
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom-start" ? "left top" : "left bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                      autoFocusItem={open}
                      id="composition-menu"
                      aria-labelledby="composition-button"
                      onKeyDown={handleListKeyDown}
                      sx={{ zIndex: 9999 }}
                    >
                      <MenuItem
                        onClick={(e) => {
                          localStorage.removeItem("token");
                          handleClose(e);
                          window.location.href = "/login";
                        }}
                      >
                        <LogoutIcon className="mr-3" />
                        Logout
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
