package me.codyben.telemetry.lehighbuswidget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.DateFormat;
import java.util.Date;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link BusUpdateWidgetConfigureActivity BusUpdateWidgetConfigureActivity}
 */
public class BusUpdateWidget extends AppWidgetProvider {

    public static String BUTTON_UPDATE = "BUTTON_UPDATE";
    RemoteViews remoteViews;
    private static final String PREFS_NAME = "me.codyben.telemetry.lehighbuswidget.BusUpdateWidget";
    private static final String PREF_PREFIX_KEY = "appwidget_";

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        //Retrieve the current time//

        String timeString =
                DateFormat.getTimeInstance(DateFormat.SHORT).format(new Date());

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.bus_update_widget);

        Intent intentUpdate = new Intent(context, BusUpdateWidget.class);
        intentUpdate.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);


        int[] idArray = new int[]{appWidgetId};
        intentUpdate.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idArray);

        PendingIntent pendingUpdate = PendingIntent.getBroadcast(
                context, appWidgetId, intentUpdate,
                PendingIntent.FLAG_UPDATE_CURRENT);
        views.setOnClickPendingIntent(R.id.button, pendingUpdate);
        //Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://code.tutsplus.com/"));
        //PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);
        //views.setOnClickPendingIntent(R.id.launch_url, pendingIntent);

//Request that the AppWidgetManager updates the application widget, by passing widgetId and the RemoteViews object//
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {

        //UPDATE REFRESH

        for (int i=0; i<appWidgetIds.length; i++)
        {
           int appWidgetId=appWidgetIds[i];

            /* other stuff to do */

            RemoteViews views=new RemoteViews(context.getPackageName(), R.layout.bus_update_widget);

            /* here you "refresh" the pending intent for the button */
            Intent clickintent=new Intent("net.example.appwidget.ACTION_WIDGET_CLICK");
            PendingIntent pendingIntentClick=PendingIntent.getBroadcast(context, 0, clickintent, 0);
            views.setOnClickPendingIntent(R.id.button, pendingIntentClick);
            appWidgetManager.updateAppWidget(appWidgetId, views);

            /* then tell the widget manager to update */
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }

        //END REFRESH
        final RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.bus_update_widget);
        for (final int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, 0);
            String res = prefs.getString(PREF_PREFIX_KEY + appWidgetId, "Alpha Phi");
            if(res.equals("Alumni Memorial Building"))
                res = "Alumni";
            else if(res.equals("Sigma Phi Epsilon"))
                res = "Sig Ep";
            else if(res.equals("Farrington Square"))
                res = "Farrington";
            views.setTextViewText(R.id.appwidget_text2, res);
            final AppWidgetManager manager = AppWidgetManager.getInstance(context);
            manager.updateAppWidget(appWidgetId, views);
            String sanitized = res.replaceAll(" ", "");
            // Log.d("FUCKINGRESULT",sanitized);
           // updateWidget("123", context);
            RequestQueue queue = Volley.newRequestQueue(context);
            String url ="https://bus.codyben.me/"+sanitized+".stop";
            Toast.makeText(context, "Bus times updated.", Toast.LENGTH_SHORT).show();
            StringRequest stringRequest = new StringRequest(Request.Method.GET, url,
                    new Response.Listener<String>() {
                        @Override
                        public void onResponse(String response) {
                            Log.d("RESPONSE",response);
                            String [] allRoute = response.split("\n");
                            if(allRoute.length == 1) {
                                String[] sData = response.split(",");
                                String d = sData[0] + " " + sData[2];
                                views.setTextViewText(R.id.sd0, d);
                                views.setTextViewText(R.id.sd1, "No Route Available");
                                manager.updateAppWidget(appWidgetId, views);
                            }else{
                                String[] sData0 = allRoute[0].split(",");
                                String[] sData1 = allRoute[1].split(",");
                                String d0 = sData0[0] + ":  " + sData0[2];
                                String d1 = sData1[0] + ":  " + sData1[2];
                                views.setTextViewText(R.id.sd0, d0);
                                views.setTextViewText(R.id.sd1, d1);
                                manager.updateAppWidget(appWidgetId, views);
                            }
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                }
            });

// Add the request to the RequestQueue.
            queue.add(stringRequest);
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        for (int appWidgetId : appWidgetIds) {
            BusUpdateWidgetConfigureActivity.deleteTitlePref(context, appWidgetId);
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    private static void updateWidget(String stop, Context context)
    {


    }

}

