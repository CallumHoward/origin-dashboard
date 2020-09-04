package main

import "origin/test/oop/employee"

func main() {
	e := employee.New("Sam", "Adolf", 30, 20)
	e.LeavesRemaining()
	e.RemoveLeaves(1)
	e.LeavesRemaining()
}
