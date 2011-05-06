import wsgiref.handlers
import cgi
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import settings
from contextIO.ContextIO import ContextIO, IMAPAdmin
from django.utils import simplejson

class FileRevisionsHandler(webapp.RequestHandler):
    def get(self):
        current_user = users.get_current_user()
        current_email = current_user.email()

        fileId = self.request.get('fileid')
        contextIO = ContextIO(api_key=settings.CONTEXTIO_OAUTH_KEY,
                              api_secret=settings.CONTEXTIO_OAUTH_SECRET,
                              api_url=settings.CONTEXTIO_API_URL)
        response = contextIO.filerevisions(fileId,account=current_email)
        self.response.out.write(simplejson.dumps(response.get_data()))

class FilesHandler(webapp.RequestHandler):
    def get(self):
        current_user = users.get_current_user()
        current_email = current_user.email()

        emailAddr = self.request.get('email')
        contextIO = ContextIO(api_key=settings.CONTEXTIO_OAUTH_KEY,
                              api_secret=settings.CONTEXTIO_OAUTH_SECRET,
                              api_url=settings.CONTEXTIO_API_URL)
        response = contextIO.contactfiles(emailAddr,account=current_email)
        self.response.out.write(simplejson.dumps(response.get_data()))

class MessagesHandler(webapp.RequestHandler):
    def get(self):
        current_user = users.get_current_user()
        current_email = current_user.email()

        emailAddr = self.request.get('email')
        contextIO = ContextIO(api_key=settings.CONTEXTIO_OAUTH_KEY,
                              api_secret=settings.CONTEXTIO_OAUTH_SECRET,
                              api_url=settings.CONTEXTIO_API_URL)
        response = contextIO.contactmessages(emailAddr,account=current_email)
        self.response.out.write(simplejson.dumps(response.get_data()))

class SearchHandler(webapp.RequestHandler):
    def get(self):
        current_user = users.get_current_user()
        current_email = current_user.email()

        searchStr = self.request.get('str')
        contextIO = ContextIO(api_key=settings.CONTEXTIO_OAUTH_KEY,
                              api_secret=settings.CONTEXTIO_OAUTH_SECRET,
                              api_url=settings.CONTEXTIO_API_URL)
        response = contextIO.contactsearch(searchStr,account=current_email)
        self.response.out.write(simplejson.dumps(response.get_data()))

def main():
    application = webapp.WSGIApplication([('/filerevisions.json', FileRevisionsHandler),
                                          ('/files.json', FilesHandler),
                                          ('/messages.json', MessagesHandler),
                                          ('/search.json', SearchHandler)], debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()