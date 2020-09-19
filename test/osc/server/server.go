package main

import "github.com/hypebeast/go-osc/osc"

func main() {
	addr := "127.0.0.1:6868"
	d := osc.NewStandardDispatcher()
	d.AddMsgHandler("/isMotionDetected", func(msg *osc.Message) {
		osc.PrintMessage(msg)
	})

	server := &osc.Server{
		Addr:       addr,
		Dispatcher: d,
	}
	server.ListenAndServe()
}
