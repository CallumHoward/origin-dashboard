package main

import (
	"fmt"
	"time"
)

func SendValues(c chan string) {
	fmt.Println("Executing Goroutine")
	time.Sleep(1 * time.Second)
	c <- "Hello World"
	fmt.Println("Finished Goroutine")
}

func SendQuitAfter(c chan bool, delay int) {
	time.Sleep(time.Duration(delay) * time.Second)
	c <- true
}

func main() {
	fmt.Println("Go Channels Tutorial")

	values := make(chan string, 10)
	defer close(values)
	quit := make(chan bool)

	go SendValues(values)
	go SendValues(values)
	go SendQuitAfter(quit, 10)
	SendValues(values)
	values <- "hello main"

	for {
		select {
		case value := <-values:
			fmt.Println(value)
			time.Sleep(1 * time.Second)
		case <-quit:
			fmt.Println("Finished")
			return
		default:
			time.Sleep(2 * time.Second)
		}
	}
}
