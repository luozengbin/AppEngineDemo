import wsgiref.handlers
import cgi
import md5
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
import settings
from contextIO2 import ContextIO, Account, Contact, File
from django.utils import simplejson as json

class FilesHandler(webapp.RequestHandler):
    def get(self):
        current_email = users.get_current_user().email()
        if validateUser(self.request.cookies, current_email):
            emailAddr = self.request.get('email')
            ctxIO = ContextIO(consumer_key=settings.CONTEXTIO_OAUTH_KEY, consumer_secret=settings.CONTEXTIO_OAUTH_SECRET)
            messages = Contact(Account(ctxIO, {'id':self.request.cookies['ctxioid'].decode('utf-8')}), {'email':emailAddr}).get_files(limit=25)
            self.response.out.write(json.dumps(messages))
        else:
            self.response.out.write('[]')


class MessagesHandler(webapp.RequestHandler):
    def get(self):
        current_email = users.get_current_user().email()
        if validateUser(self.request.cookies, current_email):
            emailAddr = self.request.get('email')
            ctxIO = ContextIO(consumer_key=settings.CONTEXTIO_OAUTH_KEY, consumer_secret=settings.CONTEXTIO_OAUTH_SECRET)
            messages = Contact(Account(ctxIO, {'id':self.request.cookies['ctxioid'].decode('utf-8')}), {'email':emailAddr}).get_messages(limit=25)
            self.response.out.write(json.dumps(messages))
        else:
            self.response.out.write('[]')

class SearchHandler(webapp.RequestHandler):
    def get(self):
        current_email = users.get_current_user().email()
        if validateUser(self.request.cookies, current_email):
            searchStr = self.request.get('str')
            ctxIO = ContextIO(consumer_key=settings.CONTEXTIO_OAUTH_KEY, consumer_secret=settings.CONTEXTIO_OAUTH_SECRET)
            contacts = Account(ctxIO, {'id':self.request.cookies['ctxioid'].decode('utf-8')}).get_contacts(search=searchStr)
            respData = []
            for i in contacts:
                respData.append({'name': i.name, 'email': i.email, 'thumbnail': i.thumbnail})
            self.response.out.write(json.dumps(respData))
        else:
            self.response.out.write('[]')

def validateUser(cookies, authEmail):
    ctxIoId = cookies['ctxioid'].decode('utf-8')
    m = md5.new()
    m.update(ctxIoId)
    m.update(authEmail)
    return m.hexdigest() == cookies['ctxiohash'].decode('utf-8')

def main():
    # make sure the account id is available from a cookie and matches the
    # authentified user.
    application = webapp.WSGIApplication([('/files.json', FilesHandler),
                                          ('/messages.json', MessagesHandler),
                                          ('/search.json', SearchHandler)], debug=True)
    util.run_wsgi_app(application)

if __name__ == '__main__':
    main()