package main

import (
	"fmt"
)

type deviceService struct {
	foo         int
	bar         int
	baz         int
	initialized bool
}

func main() {
	var ds *deviceService

	if ds != nil {
		fmt.Println("defined")
	} else {
		fmt.Println("undefined")
	}

	ds1 := deviceService{42, 53, 1, true}
	ds = &ds1

	if ds != nil {
		fmt.Println("defined")
	} else {
		fmt.Println("undefined")
	}
}
