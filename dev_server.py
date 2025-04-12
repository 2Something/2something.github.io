from livereload import Server

server = Server()
server.watch('*.html',delay=0.1)
server.watch('*.css',delay=0.1)
server.watch('*.js',delay=0.1)
server.serve(root='.', port=5500)