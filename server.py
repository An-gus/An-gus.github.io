import http.server, socketserver #import required libraries

def createHandler(port:int)->type:
    address : tuple[str,int] = ("",port) #set the port for the server to use
    requestHandler : type = http.server.SimpleHTTPRequestHandler #define a request hadler for http requests 
    return socketserver.TCPServer(address, requestHandler) #define a TCP server using the address and the http request handler

def runServer(server:type)->None:
    address : tuple[str, int] = server.server_address
    print(f"Serving at: localhost:{address[1]}")
    server.serve_forever() #run the TCP server indefinitly

def main()->None:
    server : type = createHandler(1337)
    runServer(server)

if __name__ == "__main__":
    main()